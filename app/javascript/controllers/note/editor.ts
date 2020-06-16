import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { DOMParser } from "prosemirror-model"
import { buildInputRules, buildKeymap } from "prosemirror-example-setup"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { dropCursor } from "prosemirror-dropcursor"
import { gapCursor } from "prosemirror-gapcursor"
import { history } from "prosemirror-history"

import { schema } from "./editor/schema"

export default class Editor {
  private view: EditorView

  constructor(
    editorHolder: Element,
    contentHolder: Element
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
      ]
    })

    this.view = new EditorView(editorHolder, {
      state: state,
      dispatchTransaction(transaction) {
        let view = this

        transaction.before

        console.log(`transaction`)
        console.log(transaction.before)
        console.log(transaction.doc)

        let newState = view.state.apply(transaction)
        view.updateState(newState)
      }
    })
  }
}
