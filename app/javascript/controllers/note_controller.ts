import { Controller } from 'stimulus'
import Editor from './note/editor'

class Note {
  private updatePath: string

  private updateTitleRequestController: AbortController

  constructor(
    private id: string,
    public title: string
  ){
    this.updatePath = `/notes/${this.id}`
  }

  async updateTitle(newTitle: String) {
    this.updateTitleRequestController?.abort()
    this.updateTitleRequestController = new AbortController

    let response = await fetch(this.updatePath, {
      signal: this.updateTitleRequestController.signal,
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

    return response
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

  // TODO reform logic around updating title and handling duplicate title
  async updateTitle(newTitle: string) {
    if (newTitle == this.note.title) { return }
    console.log(`updateTitle: ${newTitle}`)

    this.increaseLoadingStack()

    let response = await this.note.updateTitle(newTitle)
    if (!response.ok) {
      // TODO handle conflict
      console.error("update title response not ok")
    }

    this.decreaseLoadingStack()
    this.note.title = newTitle
  }

  async updateContent(content) {
    console.log("note_controller:updateContent")
    console.log(content)
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
