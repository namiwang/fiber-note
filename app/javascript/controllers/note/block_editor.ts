import { EditorState, Selection, Transaction } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { buildInputRules, buildKeymap } from "prosemirror-example-setup"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"

import BlockController from "controllers/block_controller"
import { createBlockIdPlugin } from "./editor/block_id_plugin"
import { getMentionsPlugin } from "./editor/mention_plugin/mention_plugin"

import { blockSchema } from './editor/schemas'

export default class BlockEditor {
  private view: EditorView

  constructor(
    private blockController: BlockController,
    editorHolder: Element,
    contentJSON: JSON,
    availableTags: string[]
  ) {
    let state = EditorState.create({
      doc: blockSchema.nodeFromJSON(contentJSON),
      plugins: [
        // before keymap plugin to override keydown handlers
        getMentionsPlugin(availableTags),
        buildInputRules(blockSchema),
        // TODO keymap around enter -> new list item
        // https://discuss.prosemirror.net/t/lists-paragraph-inside-li-instead-of-new-list-item/455
        // TODO keymap around tab and shift-tab
        // TODO extract hints about available keys
        // https://github.com/prosemirror/prosemirror-example-setup/blob/master/src/keymap.js
        keymap(buildKeymap(blockSchema)),
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

    let editor = <BlockEditor>this['editor']
    let blockContent = <JSON>newState.doc.content.toJSON()[0]

    console.log('notifying block_controller…')
    console.log(blockContent)

    editor.blockController.updateBlock(blockContent)
  }
}
