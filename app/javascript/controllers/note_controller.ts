import { Controller } from 'stimulus'
import Editor from './note/editor'

class Note {
  private updateTitleRequestController: AbortController
  private updateBlocksRequestController: AbortController

  constructor(
    private id: string,
    private title: string,
  ){}

  async request(path: string, body: object) {
    return await fetch(path, {
      signal: this.updateTitleRequestController.signal,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')['content'],
      },
      body: JSON.stringify(body)
    })
  }

  async updateTitle(newTitle: string) {
    this.updateTitleRequestController?.abort()
    this.updateTitleRequestController = new AbortController

    let response = await this.request(`/notes/${this.id}/title`, {note: {title: newTitle}})

    if (response.ok) {
      this.title = newTitle
    }

    return response
  }

  async updateBlocks(blocks: JSON[]) {
    this.updateBlocksRequestController?.abort()
    this.updateBlocksRequestController = new AbortController

    return await this.request(`/notes/${this.id}`, {note: {blocks: blocks}})
  }
}

export default class NoteController extends Controller {
  static targets = ['editorHolder', 'loader', 'titleMerger']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  editorHolderTarget: Element
  loaderTarget: Element
  titleMergerTarget: Element

  private note: Note
  private editor: Editor
  private updatingTitle: boolean = false
  private updatingBlocks: boolean = false
  private duplicatedTitle: string = null

  connect() {
    console.log('stimulus: note connected on:')
    console.log(this.element)

    this.note = new Note(
      this.data.get('id'),
      this.data.get('title')
    )

    this.initEditor()

    // trigger the title merger
    this.updateTitle(this.data.get('title'))
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

    this.duplicatedTitle = null
    this.refreshTitleMerger()

    this.updatingTitle = true
    this.refreshLoader()

    try {
      let response = await this.note.updateTitle(newTitle)

      if (response.statusText == 'Conflict') {
        this.duplicatedTitle = newTitle
        this.refreshTitleMerger()
      }

      // TODO handle regular failure
    } catch (AbortError) {}

    this.updatingTitle = false
    this.refreshLoader()
  }

  async updateBlocks(blocks: JSON[]) {
    this.updatingBlocks = true
    this.refreshLoader()

    try {
      let response = await this.note.updateBlocks(blocks)
      if (!response.ok) {
        // TODO handle failure
        console.error("update blocks response not ok")
      }
    } catch (AbortError) {}

    this.updatingBlocks = false
    this.refreshLoader()
  }

  private refreshLoader() {
    this.loaderTarget.innerHTML = (this.updatingTitle && this.updatingBlocks).toString()
  }

  private refreshTitleMerger() {
    this.titleMergerTarget.innerHTML = this.duplicatedTitle ? `conflict: ${this.duplicatedTitle}` : 'no conflict'
  }

}
