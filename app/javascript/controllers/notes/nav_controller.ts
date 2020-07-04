import { Controller } from 'stimulus'
import consumer from '../../channels/consumer'

export default class extends Controller {
  private channel

  connect() {
    console.log('stimulus: notes--nav connected on:')
    console.log(this.element)

    this.initChannel()
  }

  private initChannel() {
    this.channel = consumer.subscriptions.create('Notes::NavChannel', {
      // connected() {},
      // disconnected() {},

      received: (data: JSON) => {
        switch (data['event']) {
          case 'tags_updated':
            this.replacePartial(data['partial'])
            break
          default:
            break
        }
      }
    })
  }

  private replacePartial(partial: string) {
    let node = <HTMLElement>new DOMParser().parseFromString(partial, 'text/html').body.childNodes[0]
    this.element.innerHTML = node.innerHTML
  }
}
