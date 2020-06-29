import { Controller } from 'stimulus'
import BlockEditor from './note/block_editor'
import Block from '../models/block'

export default class BlockController extends Controller {
  static targets = ['loader']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  loaderTarget: HTMLElement

  private block: Block
  private editor: BlockEditor

  private updating: boolean = false

  connect() {
    console.log('stimulus: block connected on:')
    console.log(this.element)

    this.block = new Block(
      this.data.get('id')
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

  public updateBlock(blockContent: JSON) {
    this.setUpdating(true)
    this.block.updateLater(
      blockContent,
      () => this.handleUpdated()
    )
  }

  private handleUpdated() {
    this.setUpdating(false)
  }

  private setUpdating(value: boolean) {
    this.updating = value
    this.refreshLoader()
  }

  private refreshLoader() {
    let loading = this.updating
    let visibility = loading ? 'visible' : 'hidden'
    this.loaderTarget.style.visibility = visibility
  }
}
