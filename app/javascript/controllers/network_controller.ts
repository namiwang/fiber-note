import { Controller } from 'stimulus'

import cytoscape from 'cytoscape'

export default class extends Controller {
  static targets = ['graph']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  graphTarget: HTMLElement

  connect() {
    console.log('stimulus: network connected on:')
    console.log(this.element)

    this.initGraph()
  }

  private initGraph() {
    cytoscape({
      container: this.graphTarget,
      elements: {
        nodes: [
          {
            data: { id: 'a' }
          },
          {
            data: { id: 'b' }
          }
        ],
        edges: [
          {
            data: { id: 'ab', source: 'a', target: 'b' }
          }
        ]
      },
      layout: {
        name: 'preset'
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        }
      ]
    })
  }

}
