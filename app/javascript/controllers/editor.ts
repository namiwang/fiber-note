import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import * as basicSchema from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {buildInputRules, buildKeymap} from "prosemirror-example-setup"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"
import {dropCursor} from "prosemirror-dropcursor"
import {gapCursor} from "prosemirror-gapcursor"
import {history} from "prosemirror-history"

// TODO drop prosemirror-schema-list and custom our schema
const RorSchema = new Schema({
  nodes: addListNodes(basicSchema.schema.spec.nodes, "paragraph block*", "block"),
  marks: basicSchema.schema.spec.marks
})

class Editor {
  private view: EditorView

  constructor(element: Element) {
    let state = EditorState.create({
      doc: DOMParser.fromSchema(RorSchema).parse(document.querySelector("#content")),
      plugins: [
        buildInputRules(RorSchema),
        keymap(baseKeymap),
        // TODO extract hints about available keys
        keymap(buildKeymap(RorSchema)),
        dropCursor(),
        gapCursor(),
        history(),
      ]
    })

    this.view = new EditorView(element, {
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

export default Editor
