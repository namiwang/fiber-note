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
    let nodes = JSON.parse(this.data.get('nodes'))
    let edges = JSON.parse(this.data.get('edges'))

    let cy = cytoscape({
      container: this.graphTarget,
      elements: {
        nodes: nodes,
        edges: edges
      },
      layout: {
        name: 'grid',
        animate: false
      },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)'
          }
        },
        { // TODO dont know why but the edge arrow is not working
          selector: 'edge',
          style: {
            'target-arrow-shape': 'triangle',
            'target-arrow-fill': 'hollow',
          }
        }
      ],
    })

    cy.zoom(0.85)
    cy.center()

    cy.on('tap', 'node', function(){
      window.location.href = this.data('href')
    })
  }
}
