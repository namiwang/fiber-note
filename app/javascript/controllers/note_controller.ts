import { Controller } from 'stimulus'
import Quill, { Sources } from 'quill'
// TODO ts cant find declaration file for module 'quill-delta'
// it's a mess between quill, quill-delta, and @types/quill
// quill 1.3.7 depends on quill-delta 3
// yet @types/quill is using quill-delta 4
// let's revisit this issue after we migrate to quill-2
import Delta from 'quill-delta'

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
  private quill: Quill
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
    this.quill = new Quill('#editor', {
      debug: 'info',
      modules: {},
      placeholder: 'Compose an epic...',
      // readOnly: true,
      theme: 'bubble'
    })

    this.quill.on('text-change', this.updateContent)
  }

  async updateTitle(event: Event) {
    let input = <HTMLInputElement>event.target
    let newTitle = input.value

    this.increaseLoadingStack()

    let responseOk = await this.note.updateTitle(newTitle)
    // TODO handle conflict

    this.decreaseLoadingStack()
  }

  async updateContent(delta: Delta, oldContents: Delta, sources: Sources) {
    console.log(delta)
    console.log(oldContents)
    console.log(sources)
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
