// Visit The Stimulus Handbook for more details 
// https://stimulusjs.org/handbook/introduction
// 
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from 'stimulus'
import { Quill } from 'quill'

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

    this.quill = new Quill('#editor', {
      debug: 'info',
      modules: {
        // toolbar: '#toolbar'
      },
      placeholder: 'Compose an epic...',
      // readOnly: true,
      theme: 'bubble'
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
