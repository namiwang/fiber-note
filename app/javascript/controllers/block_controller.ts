import { Controller } from 'stimulus'

export default class BlockController extends Controller {
  static targets = ['editorHolder', 'loader', 'titleMerger']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  editorHolderTarget: Element
  loaderTarget: Element

  connect() {
    console.log('stimulus: block connected on:')
    console.log(this.element)
  }
}
