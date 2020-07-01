import { EditorState, Selection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { buildInputRules, buildKeymap } from "prosemirror-example-setup"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
// import { dropCursor } from "prosemirror-dropcursor"
// import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"

import NoteController from "controllers/note_controller"
import { createBlockIdPlugin } from "./editor/block_id_plugin"
import { getMentionsPlugin } from "./editor/mention_plugin/mention_plugin"

import { noteSchema } from './editor/schemas'
import { sinkListItem, liftListItem } from "prosemirror-schema-list"
import { createTopList, splitListItemAndStripAttrs } from "./editor/list_cmds"

type SerializedContent = [string, JSON[]]

// blocks: [{type: list_item, content: [{p}, {bullet_list}]}]
function serializeDoc(doc): SerializedContent {
  let content = doc.content.toJSON()

  let title = content.shift().content[0].text.trim()

  if (content.length == 0) { return [title, []] }

  let topList = content[0]
  let blocks = topList.content

  return [title, blocks]
}

export default class NoteEditor {
  private view: EditorView

  constructor(
    private noteController: NoteController,
    editorHolder: Element,
    contentJSON: JSON,
    availableTags: string[]
  ) {
    let state = EditorState.create({
      doc: noteSchema.nodeFromJSON(contentJSON),
      plugins: [
        // before keymap plugin to override keydown handlers
        getMentionsPlugin(availableTags),

        // hijack enter to create a top level list and first list item
        keymap({'Enter': createTopList}),

        // keymap around tab and shift-tab
        keymap({'Tab': sinkListItem(noteSchema.nodes['list_item'])}),
        keymap({'Shift-Tab': liftListItem(noteSchema.nodes['list_item'])}),

        // keymaps from example-setup, we override useless ones, and hacked some others
        // ref https://github.com/prosemirror/prosemirror-example-setup/blob/master/src/keymap.js
        keymap(buildKeymap(noteSchema, {
          // Inspect the given schema looking for marks and nodes from the
          // basic schema, and if found, add key bindings related to them.
          // This will add:
          //
          // * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
          // * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
          // * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
          // * **Ctrl-Shift-0** for making the current textblock a paragraph
          'Ctrl-Shift-0': false,
          // * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
          'Ctrl-Shift-1': false,
          //   textblock a heading of the corresponding level
          // * **Ctrl-Shift-Backslash** to make the current textblock a code block
          'Ctrl-Shift-Backslash': false,
          // * **Ctrl-Shift-8** to wrap the selection in an ordered list
          'Ctrl-Shift-8': false,
          // * **Ctrl-Shift-9** to wrap the selection in a bullet list
          'Ctrl-Shift-9': false,
          // * **Ctrl->** to wrap the selection in a block quote
          'Ctrl->': false,
          // * **Enter** to split a non-empty textblock in a list item while at
          //   the same time splitting the list item
          'Enter': false,
          // * **Mod-Enter** to insert a hard break
          // * **Mod-_** to insert a horizontal rule
          'Mod-_': false,
          // * **Backspace** to undo an input rule
          'Backspace': false,
          // * **Alt-ArrowUp** to `joinUp`
          'Alt-ArrowUp': false,
          // * **Alt-ArrowDown** to `joinDown`
          'Alt-ArrowDown': false,
          // * **Mod-BracketLeft** to `lift`
          'Mod-BracketLeft': false,
          // * **Escape** to `selectParentNode`
          'Escape': false,
        })),
        keymap({'Enter': splitListItemAndStripAttrs(noteSchema.nodes['list_item'])}),

        keymap(baseKeymap),

        // some input rules from example-setup
        // buildInputRules(noteSchema),

        // TODO
        // dropCursor(),
        // gapCursor(),

        history(),

        createBlockIdPlugin(),
      ]
    })

    this.view = new EditorView(editorHolder, {
      state: state,
      dispatchTransaction: this.dispatchTransaction
    })
    this.view['editor'] = this
  }

  focusAtEnd() {
    this.view.focus()

    // set cursor at the end
    // TODO fix type error, I'm thinking the @types package is out of date
    // @ts-ignore
    let selection = Selection.atEnd(this.view.docView.node)
    let tr = this.view.state.tr.setSelection(selection)
    let state = this.view.state.apply(tr)
    this.view.updateState(state)
  }

  // NOTE
  // so here's a tricky one,
  // we implemented a plugin, to append a transaction
  // yet here the `transaction` we receive is not that,
  // is the transaction before the plugin one,
  // so we have to use `newState.doc` to get the real current content
  dispatchTransaction(transaction: Transaction) {
    // `this` will be bound to this EditorView
    let view = this as unknown as EditorView

    // standard protocol start
    let newState = view.state.apply(transaction)
    view.updateState(newState)
    // standard protocol end

    if (!transaction.docChanged) { return }

    let editor = <NoteEditor>this['editor']
    let [title, blocks] = serializeDoc(newState.doc)

    console.log('notifying note_controller…')
    console.log(newState.doc.toJSON())

    editor.noteController.updateTitle(title)
    editor.noteController.updateBlocks(blocks)
  }
}
