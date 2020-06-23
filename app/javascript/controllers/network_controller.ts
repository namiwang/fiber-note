import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['graph']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  graphTarget: Element

  connect() {
    console.log('stimulus: network connected on:')
    console.log(this.element)
  }

}
