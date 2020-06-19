import { EditorState, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { DOMParser } from "prosemirror-model"
import { buildInputRules, buildKeymap } from "prosemirror-example-setup"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"

import NoteController from "controllers/note_controller"
import { schema } from "./editor/schema"
import { createBlockIdPlugin } from "./editor/block_id_plugin"

type SerializedContent = [string, object]

function serializeDoc(doc): SerializedContent {
  let blocks: [] = doc.content.toJSON()
  // @ts-ignore
  let title = blocks.shift().content[0].text.trim()

  return [title, blocks]
}

export default class Editor {
  constructor(
    private noteController: NoteController,
    editorHolder: Element,
    contentHolder: Element,
  ) {
    let state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(contentHolder),
      plugins: [
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

    let view = new EditorView(editorHolder, {
      state: state,
      dispatchTransaction: this.dispatchTransaction
    })
    view['editor'] = this
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

    editor.noteController.updateTitle(title)
    editor.noteController.updateBlocks(blocks)
  }
}
