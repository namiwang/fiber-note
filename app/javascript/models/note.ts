import consumer from "../channels/consumer"

const DEBOUNCE_DURATION = 200

export default class Note {
  private channel

  private latestUpdatingBlocksRequsetedAt: number

  private updatingBlocksDebouncer: NodeJS.Timeout

  private updateTitleRequestController: AbortController

  constructor(
    private id: string,

    private onBlocksUpdated: Function,

    // title used in the last, or current request
    // or the init value
    private title: string,
  ){
    this.initChannel()
  }

  private initChannel() {
    this.channel = consumer.subscriptions.create({
      channel: 'NoteChannel',
      note_id: this.id
    }, {
      connected() { console.log('noteChannel:connected') },
      disconnected() { console.log('noteChannel:disconnected') },
      received: (data) => this.handleChannelData(data),
    })
  }

  handleChannelData(data: object) {
    switch (data['event']) {
      case 'blocks_updated':
        if (data['requested_at'] != this.latestUpdatingBlocksRequsetedAt) { return }
        this.onBlocksUpdated()
        break;
      default:
        break;
    }
  }

  async request(path: string, signal: AbortSignal, body: object) {
    return await fetch(path, {
      signal: signal,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')['content'],
      },
      body: JSON.stringify(body)
    })
  }

  async updateTitle(newTitle: string) {
    if (newTitle == this.title) { return }
    this.title = newTitle

    console.log(`note.updateTitle: ${newTitle}`)

    this.updateTitleRequestController?.abort()
    this.updateTitleRequestController = new AbortController

    let response = await this.request(
      `/notes/${this.id}/title`,
      this.updateTitleRequestController.signal,
      {note: {title: newTitle}}
    )

    if (response.ok) {
      this.title = newTitle
    }

    return response
  }

  public updateBlocksLater(blocks: JSON[]) {
    if (this.updatingBlocksDebouncer) {
      clearTimeout(this.updatingBlocksDebouncer)
    }

    this.updatingBlocksDebouncer = setTimeout(
      () => { this.updateBlocks(blocks)},
      DEBOUNCE_DURATION
    )
  }

  private updateBlocks(blocks: JSON[]) {
    this.latestUpdatingBlocksRequsetedAt = Date.now()
    this.channel.perform('update_blocks', {
      note: {
        id: this.id,
        blocks: blocks
      },
      requested_at: this.latestUpdatingBlocksRequsetedAt
    })
  }
}
