import { EditorState, Selection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { buildInputRules, buildKeymap } from "prosemirror-example-setup"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
// import { dropCursor } from "prosemirror-dropcursor"
// import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"

import NoteController from "controllers/note_editor_controller"
import { createBlockIdPlugin } from "./editor/block_id_plugin"
import { getMentionsPlugin } from "./editor/mention_plugin/mention_plugin"

import { noteSchema } from './editor/schema'
import { sinkListItem, liftListItem } from "prosemirror-schema-list"
import { createTopList, splitListItemAndStripAttrs } from "./editor/list_cmds"
import { extraKeymap } from "./editor/extra_keymap"

export default class NoteEditor {
  private view: EditorView

  constructor(
    private noteController: NoteController,
    editorHolder: Element,
    contentJSON: JSON,
    availableTags: string[],
  ) {
    let state = EditorState.create({
      doc: noteSchema.nodeFromJSON(contentJSON),
      plugins: [
        // before keymap plugin to override keydown handlers
        getMentionsPlugin(availableTags),

        // hijack enter to create a top level list and first list item
        keymap({'Enter': createTopList}),

        keymap(extraKeymap),

        keymap(baseKeymap),

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
    let [title, blocks] = editor.serializeDoc(newState.doc)

    console.log('notifying note_controller…')
    console.log(newState.doc.toJSON())

    editor.noteController.updateTitle(title)
    editor.noteController.updateBlocks(blocks)
  }

  // title: string
  // blocks: [{type: list_item, content: [{p}, {bullet_list}]}]
  private serializeDoc(doc): [string|null, JSON[]] {
    let content = <JSON[]>doc.content.toJSON()

    // title
    let titleNodeContent = content.find((b) => b['type'] == 'h1')['content']
    let title = titleNodeContent ? titleNodeContent[0].text.trim() : null

    // blocks
    let topList = content.find((b) => b['type'] == 'bullet_list')
    let blocks = topList ? topList['content'] : []

    return [title, blocks]
  }
}
