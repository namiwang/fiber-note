import { Controller } from 'stimulus'
import NoteEditor from './note/note_editor'
import Note from '../models/note'

export default class NoteEditorController extends Controller {
  static targets = ['loader', 'titleMerger']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  loaderTarget: HTMLElement
  titleMergerTarget: HTMLElement

  private mode: string // note/block

  private note: Note
  private editor: NoteEditor

  private updatingTitle: boolean = false
  private updatingBlocks: boolean = false

  private duplicatedTitle: string

  connect() {
    console.log('stimulus: note editor connected on:')
    console.log(this.element)

    this.mode = this.data.get('mode')

    this.note = new Note(
      this.data.get('note-id'),
      this.data.get('note-title')
    )

    this.initEditor()

    this.refreshLoader()
  }

  private initEditor() {
    this.editor = new NoteEditor(
      this,
      this.element,
      JSON.parse(this.data.get('note-content')),
      JSON.parse(this.data.get('available-tags')),
    )
    this.focus()
  }

  focus() {
    this.editor.focusAtEnd()
  }

  public updateTitle(title: string) {
    this.setUpdatingTitle(true)
    this.note.updateTitleLater(
      title,
      () => this.handleTitleUpdated(),
      (title: string) => this.handleTitleDuplicated(title),
    )
  }

  private handleTitleUpdated() {
    this.setUpdatingTitle(false)
    this.setDuplicatedTitle(null)
  }

  private handleTitleDuplicated(duplicatedTitle: string) {
    if (this.duplicatedTitle) { return }

    this.setUpdatingTitle(false)
    this.setDuplicatedTitle(duplicatedTitle)
  }

  public updateBlocks(blocks: JSON[]) {
    this.setUpdatingBlocks(true)
    this.note.updateBlocksLater(
      blocks,
      () => this.handleBlocksUpdated()
    )
  }

  private handleBlocksUpdated() {
    this.setUpdatingBlocks(false)
  }

  private setUpdatingTitle(value: boolean) {
    this.updatingTitle = value
    this.refreshLoader()
  }

  private setUpdatingBlocks(value: boolean) {
    this.updatingBlocks = value
    this.refreshLoader()
  }

  private setDuplicatedTitle(title: string) {
    this.duplicatedTitle = title

    this.titleMergerTarget.innerHTML = `
      content not saving due to title conflicting with 
      <span class="duplicated-title">
        ${title}
      </span>
    `
    let display = this.duplicatedTitle ? 'block' : 'none'
    this.titleMergerTarget.style.display = display

    this.refreshLoader()
  }

  private refreshLoader() {
    let loading = this.updatingTitle || this.updatingBlocks
    let display = loading ? 'block' : 'none'

    if (this.duplicatedTitle) { display = 'none' }

    this.loaderTarget.style.display = display
  }
}
