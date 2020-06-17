import { Controller } from 'stimulus'
import Editor from './note/editor'

class Note {
  private updatePath: string

  constructor(
    private id: string,
    private title: string
  ){
    this.updatePath = `/notes/${this.id}`
  }

  async updateTitle(newTitle: String) {
    let response = await fetch(this.updatePath, {
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

export default class NoteController extends Controller {
  static targets = ['editorHolder', 'contentHolder', 'loader']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  editorHolderTarget: Element
  contentHolderTarget: Element
  loaderTarget: Element

  private note: Note
  private loadingStack = 0
  private editor: Editor

  connect() {
    console.log('stimulus: note connected on:')
    console.log(this.element)

    this.note = new Note(
      this.data.get('id'),
      this.data.get('title')
    )

    this.initEditor()
  }

  private initEditor() {
    this.editor = new Editor(
      this,
      this.editorHolderTarget,
      this.contentHolderTarget,
    )
  }

  async updateTitle(newTitle: string) {
    console.log(`updateTitle: ${newTitle}`)

    this.increaseLoadingStack()

    let responseOk = await this.note.updateTitle(newTitle)
    // TODO handle conflict

    this.decreaseLoadingStack()
  }

  // async updateContent() {
  // }

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
