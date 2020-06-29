import consumer from "../channels/consumer"

const DEBOUNCE_DURATION = 200

export default class Block {
  private channel

  private latestUpdatingRequsetedAt: number
  private updatingDebouncer: number

  private onUpdated: () => void

  constructor(
    private id: string,
  ){
    this.initChannel()
  }

  private initChannel() {
    this.channel = consumer.subscriptions.create({
      channel: 'BlockChannel',
      id: this.id
    }, {
      connected() { console.log('blockChannel:connected') },
      disconnected() { console.log('blockChannel:disconnected') },
      received: (data) => this.handleChannelData(data),
    })
  }

  handleChannelData(data: object) {
    switch (data['event']) {
      case 'updated':
        if (data['requested_at'] != this.latestUpdatingRequsetedAt) { return }
        this.onUpdated()
        break;
      default:
        break;
    }
  }

  public updateLater(
    content: JSON,
    updatedHandler,
  ) {
    this.onUpdated = updatedHandler

    if (this.updatingDebouncer) {
      clearTimeout(this.updatingDebouncer)
    }

    this.updatingDebouncer = window.setTimeout(
      () => { this.update(content) },
      DEBOUNCE_DURATION
    )
  }

  private update(content: JSON) {
    this.latestUpdatingRequsetedAt = Date.now()
    this.channel.perform('update', {
      block: {
        id: this.id,
        content: content
      },
      requested_at: this.latestUpdatingRequsetedAt
    })
  }
}
