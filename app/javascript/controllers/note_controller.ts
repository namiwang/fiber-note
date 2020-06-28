import { Controller } from 'stimulus'
import { nodeSchema } from './note/editor/schemas'
import Editor from './note/editor'
import Note from '../models/note'

const DEBOUNCE_DURATION = 200

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

  private updatingTitleDebouncer

  connect() {
    console.log('stimulus: note connected on:')
    console.log(this.element)

    this.note = new Note(
      this.data.get('id'),
      () => this.handleBlocksUpdated(),
      this.data.get('title'),
    )

    this.initEditor()

    // trigger the title merger
    this.updateTitle(this.data.get('title'))
  }

  private initEditor() {
    this.editor = new Editor(
      this,
      nodeSchema,
      this.editorHolderTarget,
      JSON.parse(this.data.get('content')),
      JSON.parse(this.data.get('availableTags')),
    )
    this.editor.focusAtEnd()
  }

  updateTitleLater(title: string) {
    if (this.updatingTitleDebouncer) {
      clearTimeout(this.updatingTitleDebouncer)
    }

    this.updatingTitleDebouncer = setTimeout(
      () => { this.updateTitle(title)},
      DEBOUNCE_DURATION
    )
  }

  // TODO reform logic around updating title and handling duplicate title
  async updateTitle(newTitle: string) {
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
    this.setUpdatingBlocks(true)
    this.note.updateBlocksLater(blocks)
  }

  private handleBlocksUpdated() {
    this.setUpdatingBlocks(false)
  }

  private setUpdatingBlocks(value: boolean) {
    this.updatingBlocks = value
    this.refreshLoader()
  }

  private refreshLoader() {
    this.loaderTarget.innerHTML = (this.updatingTitle || this.updatingBlocks).toString()
  }

  private refreshTitleMerger() {
    this.titleMergerTarget.innerHTML = this.duplicatedTitle ? `conflict: ${this.duplicatedTitle}` : 'no conflict'
  }

}
