import { Controller } from 'stimulus'

import 'trix'

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
  static targets = ['loader']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  loaderTarget: Element

  private note: Note
  private loadingStack = 0
  private editorElement: Element

  connect() {
    console.log('stimulus: note connected on:')
    console.log(this.element)

    this.note = new Note(
      this.data.get('id')
    )

    // HACK
    // tried to use the `target` system provided by stimulus,
    // yet the `editorTarget` assigned by stimulus
    // doesn't have the `document` property added by trix
    // maybe it's a timing/lifecycle thing
    // https://github.com/stimulusjs/stimulus/issues/312
    this.editorElement = document.querySelector('trix-editor')
  }

  async updateTitle(event: Event) {
    let input = <HTMLInputElement>event.target
    let newTitle = input.value

    this.increaseLoadingStack()

    let responseOk = await this.note.updateTitle(newTitle)
    // TODO handle conflict

    this.decreaseLoadingStack()
  }

  // 
  // content
  // 

  async updateContent(_event: Event) {
    // amend content
    // 1. force top level <li>
    // 2. force <li> with uuid
    // 3. markdown

    this.forceTopLvLi()
  }

  forceTopLvLi() {
    let doc = this.editorElement.editor.getDocument()

    console.log(doc)
  }

  // 
  // loader
  // 

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
