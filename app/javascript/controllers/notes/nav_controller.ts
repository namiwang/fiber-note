import { Controller } from 'stimulus'
import consumer from '../../channels/consumer'

export default class extends Controller {
  private channel
  private currentNoteId: string

  connect() {
    console.log('stimulus: notes--nav connected on:')
    console.log(this.element)

    this.currentNoteId = (<HTMLElement>document.querySelector('[data-controller=note]')).dataset["noteId"]

    this.initChannel()
  }

  private initChannel() {
    this.channel = consumer.subscriptions.create('Notes::NavChannel', {
      // connected() {},
      // disconnected() {},

      received: (data: JSON) => {
        switch (data['event']) {
          case 'notes_updated':
            this.requestPartial()
            break
          case 'partial_rendered':
            this.replacePartial(data['partial'])
            break
          default:
            break
        }
      }
    })
  }

  private requestPartial() {
    this.channel.perform('request_partial', {
      current_note_id: this.currentNoteId
    })
  }

  private replacePartial(partial: string) {
    let node = <HTMLElement>new DOMParser().parseFromString(partial, 'text/html').body.childNodes[0]
    this.element.innerHTML = node.innerHTML
  }
}
