import { EditorState, Transaction, TextSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { noteSchema } from "./schemas"

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

    // TODO move cursor
    tr.setSelection(TextSelection.atEnd(tr.doc))

    dispatch(tr.scrollIntoView())

    return true
  }

  return false
}
