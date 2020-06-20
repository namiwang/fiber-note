import { Controller } from 'stimulus'
import Editor from './note/editor'

class Note {
  private updatePath: string

  private updateTitleRequestController: AbortController
  private updateBlocksRequestController: AbortController

  constructor(
    private id: string,
    public title: string,
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

  async updateBlocks(blocks: JSON[]) {
    this.updateBlocksRequestController?.abort()
    this.updateBlocksRequestController = new AbortController

    let response = await fetch(this.updatePath, {
      signal: this.updateBlocksRequestController.signal,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')['content'],
      },
      body: JSON.stringify({
        note: {
          blocks: blocks
        }
      })
    })

    return response
  }
}

export default class NoteController extends Controller {
  static targets = ['editorHolder', 'loader']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  editorHolderTarget: Element
  loaderTarget: Element

  private note: Note
  private editor: Editor
  private updatingTitle: boolean = false
  private updatingBlocks: boolean = false

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
      JSON.parse(this.data.get('content')),
      JSON.parse(this.data.get('availableTags')),
    )
  }

  // TODO reform logic around updating title and handling duplicate title
  async updateTitle(newTitle: string) {
    console.log(`updateTitle: ${newTitle}`)

    this.updatingTitle = true
    this.refreshLoader()

    let response = await this.note.updateTitle(newTitle)
    if (!response.ok) {
      // TODO handle conflict
      console.error("update title response not ok")
    }

    this.updatingTitle = false
    this.refreshLoader()

    this.note.title = newTitle
  }

  async updateBlocks(blocks: JSON[]) {
    this.updatingBlocks = true
    this.refreshLoader()

    let response = await this.note.updateBlocks(blocks)
    if (!response.ok) {
      // TODO handle conflict
      console.error("update blocks response not ok")
    }

    this.updatingBlocks = false
    this.refreshLoader()
  }

  private refreshLoader() {
    this.loaderTarget.innerHTML = (this.updatingTitle && this.updatingBlocks).toString()
  }
}
