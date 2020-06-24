import { EditorState, Selection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { buildInputRules, buildKeymap } from "prosemirror-example-setup"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"

import NoteController from "controllers/note_controller"
import { createBlockIdPlugin } from "./editor/block_id_plugin"
import { getMentionsPlugin } from "./editor/mention_plugin/mention_plugin"
import { Schema } from "prosemirror-model"

type SerializedContent = [string, JSON[]]

function serializeDoc(doc): SerializedContent {
  let blocks = doc.content.toJSON()
  // @ts-ignore
  let title = blocks.shift().content[0].text.trim()

  return [title, blocks]
}

export default class Editor {
  private view: EditorView

  constructor(
    private noteController: NoteController,
    schema: Schema,
    editorHolder: Element,
    contentJSON: JSON,
    availableTags: string[]
  ) {
    let state = EditorState.create({
      doc: schema.nodeFromJSON(contentJSON),
      plugins: [
        // before keymap plugin to override keydown handlers
        getMentionsPlugin(availableTags),
        buildInputRules(schema),
        // TODO keymap around enter -> new list item
        // https://discuss.prosemirror.net/t/lists-paragraph-inside-li-instead-of-new-list-item/455
        // TODO keymap around tab and shift-tab
        // TODO extract hints about available keys
        // https://github.com/prosemirror/prosemirror-example-setup/blob/master/src/keymap.js
        keymap(buildKeymap(schema)),
        keymap(baseKeymap),
        dropCursor(),
        gapCursor(),
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

    let editor = <Editor>this['editor']
    let [title, blocks] = serializeDoc(newState.doc)

    console.log('notifying note_controller…')
    console.log(newState.doc.toJSON())

    editor.noteController.updateTitleLater(title)
    editor.noteController.updateBlocksLater(blocks)
  }
}
