import { Controller } from 'stimulus'

import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {buildInputRules, buildKeymap} from "prosemirror-example-setup"
import {keymap} from "prosemirror-keymap"
import {baseKeymap} from "prosemirror-commands"
import {dropCursor} from "prosemirror-dropcursor"
import {gapCursor} from "prosemirror-gapcursor"
import {history} from "prosemirror-history"

class Note {
  constructor(
    private id: string
  ){}

  async updateTitle(newTitle: String) {
    let path = `/notes/${this.id}`

    let response = await fetch(path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')['content'],
      },
      body: JSON.stringify({
        note: {
          title: newTitle
        }
      })
    })

    return response.ok
  }
}

export default class extends Controller {
  static targets = ['editor', 'loader']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  editorTarget: Element
  loaderTarget: Element

  private note: Note
  private loadingStack = 0

  connect() {
    console.log('stimulus: note connected on:')
    console.log(this.element)

    this.note = new Note(
      this.data.get('id')
    )

    this.initEditor()
  }

  private initEditor() {
    // Mix the nodes from prosemirror-schema-list into the basic schema to
    // create a schema with list support.
    let mySchema = new Schema({
      nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
      marks: schema.spec.marks
    })

    let state = EditorState.create({
      doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
      plugins: [
        buildInputRules(mySchema),
        keymap(buildKeymap(mySchema)),
        keymap(baseKeymap),
        dropCursor(),
        gapCursor(),
        history(),
      ]
    })

    let view = new EditorView(this.editorTarget, {
      state: state
    })
  }

  async updateTitle(event: Event) {
    let input = <HTMLInputElement>event.target
    let newTitle = input.value

    this.increaseLoadingStack()

    let responseOk = await this.note.updateTitle(newTitle)
    // TODO handle conflict

    this.decreaseLoadingStack()
  }

  async updateContent(event: Event) {
    console.log(event)
  }

  private increaseLoadingStack() {
    this.loadingStack += 1
    this.refreshLoader()
  }

  private decreaseLoadingStack() {
    this.loadingStack -= 1
    this.refreshLoader()
  }

  private refreshLoader() {
    this.loaderTarget.innerHTML = `${this.loadingStack}`
  }
}
