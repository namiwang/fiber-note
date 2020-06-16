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
  private state: EditorState
  private view: EditorView

  constructor(element: Element) {
    this.state = EditorState.create({
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
      state: this.state
    })
  }
}

export default Editor
