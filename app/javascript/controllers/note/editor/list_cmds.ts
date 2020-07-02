import { EditorState, Transaction, TextSelection } from "prosemirror-state"
import { canSplit } from "prosemirror-transform"
import { EditorView } from "prosemirror-view"
import { noteSchema } from "./schemas"
import { Fragment, Slice } from "prosemirror-model"

// hijack this
// `"Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),`
// especially `createParagraphNear`
// https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.js#L574
export function createTopList(
  state: EditorState<any>,
  dispatch: (tr: Transaction<any>) => void,
  view: EditorView<any>
): boolean {
  if (
    dispatch &&

    // if only a title
    // @ts-ignore
    state.doc.content.content.length == 1 &&
    // @ts-ignore
    state.doc.content.content[0].type.name == 'h1' && // TODO 'title' later

    // and selected nothing
    state.selection.empty

    // TODO and at the end of the title
    // state.selection.atEnd
  ) {
    let bullet_list = noteSchema.nodes.bullet_list.create(
      null,
      noteSchema.nodes.list_item.create(
        null,
        noteSchema.nodes.paragraph.create()
      )
    )

    let pos = state.selection.$from.pos
    let tr = state.tr.insert(pos, bullet_list)

    tr.setSelection(TextSelection.atEnd(tr.doc))

    dispatch(tr.scrollIntoView())

    return true
  }

  return false
}

// NOTE
// the default `splitListItem` from `prosemirror-schema-list`, uses `tr.split` to create a new <li>,
// which by default inherit all the attrs, including `block_id`
// 
// this is a forked hijack to fix that
// 
// https://discuss.prosemirror.net/t/confused-about-typesafter-in-split-and-how-to-disable-attrs-inheriting/2952
// https://github.com/prosemirror/prosemirror-schema-list/blob/master/src/schema-list.js
//
// :: (NodeType) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Build a command that splits a non-empty textblock at the top level
// of a list item by also splitting that list item.
export function splitListItemAndStripAttrs(itemType) {
  return function(state, dispatch) {
    let {$from, $to, node} = state.selection
    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) return false
    let grandParent = $from.node(-1)
    if (grandParent.type != itemType) return false
    if ($from.parent.content.size == 0) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if ($from.depth == 2 || $from.node(-3).type != itemType ||
          $from.index(-2) != $from.node(-2).childCount - 1) return false
      if (dispatch) {
        let wrap = Fragment.empty, keepItem = $from.index(-1) > 0
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (let d = $from.depth - (keepItem ? 1 : 2); d >= $from.depth - 3; d--)
          wrap = Fragment.from($from.node(d).copy(wrap))
        // Add a second list item with an empty default start node
        wrap = wrap.append(Fragment.from(itemType.createAndFill()))
        let tr = state.tr.replace($from.before(keepItem ? null : -1), $from.after(-3), new Slice(wrap, keepItem ? 3 : 2, 2))
        tr.setSelection(state.selection.constructor.near(tr.doc.resolve($from.pos + (keepItem ? 3 : 2))))
        dispatch(tr.scrollIntoView())
      }
      return true
    }
    let nextType = $to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null
    let tr = state.tr.delete($from.pos, $to.pos)
    let types = nextType && [null, {type: nextType}]
    if (!canSplit(tr.doc, $from.pos, 2, types)) return false

    // HACK
    // 
    // NOTE
    // I dont know why, dont ask
    // I tried to *do the right thing* to modify this `types` before `canSplit`,
    // yet changing it caused `canSplit` to return false
    // spent a day digging into the code,
    // `validContent`, `matchFragment`, eventually `matchType`
    // in the original version, the parameter in `matchType` is a `text`,
    // yet in the hijacked one, it's a `list_item`
    // 
    // stopped debugging, made a patch here, and it worked
    // 
    types[0] = {type: itemType}
    types[0]['attrs'] = {block_id: ''}

    if (dispatch) dispatch(tr.split($from.pos, 2, types).scrollIntoView())
    return true
  }
}
