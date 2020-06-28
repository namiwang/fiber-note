import { Controller } from 'stimulus'
import BlockEditor from './note/block_editor'
import Note from '../models/note'

export default class BlockController extends Controller {
  static targets = ['loader']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  loaderTarget: HTMLElement

  private id: string

  private note: Note
  private editor: BlockEditor

  private updatingBlock: boolean = false

  connect() {
    console.log('stimulus: block connected on:')
    console.log(this.element)

    this.id = this.data.get('id')

    this.note = new Note(
      this.data.get('noteId')
    )

    this.initEditor()

    this.refreshLoader()
  }

  private initEditor() {
    this.editor = new BlockEditor(
      this,
      this.element,
      JSON.parse(this.data.get('content')),
      JSON.parse(this.data.get('availableTags')),
    )
  }

  public updateBlock(block: JSON) {
    this.setUpdatingBlock(true)
    this.note.updateBlockLater(
      this.id,
      block,
      () => this.handleBlockUpdated()
    )
  }

  private handleBlockUpdated() {
    this.setUpdatingBlock(false)
  }

  private setUpdatingBlock(value: boolean) {
    this.updatingBlock = value
    this.refreshLoader()
  }

  private refreshLoader() {
    let loading = this.updatingBlock
    let visibility = loading ? 'visible' : 'hidden'
    this.loaderTarget.style.visibility = visibility
  }
}
