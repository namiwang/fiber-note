import consumer from "../channels/consumer"

const DEBOUNCE_DURATION = 200

export default class Note {
  private channel

  private latestUpdatingTitleRequsetedAt: number
  private latestUpdatingBlocksRequsetedAt: number
  private updatingTitleDebouncer: number
  private updatingBlocksDebouncer: number

  private onTitleUpdated: () => void
  private onTitleDuplicated: (string) => void
  private onBlocksUpdated: () => void

  constructor(
    private id: string,
    startingTitle: string,
  ){
    this.initChannel(startingTitle)
  }

  private initChannel(startingTitle: string) {
    this.channel = consumer.subscriptions.create({
      channel: 'NoteChannel',
      id: this.id,
      title: startingTitle
    }, {
      connected() { console.log('noteChannel:connected') },
      disconnected() { console.log('noteChannel:disconnected') },
      received: (data) => this.handleChannelData(data),
    })
  }

  handleChannelData(data: object) {
    switch (data['event']) {
      case 'title_updated':
        if (data['requested_at'] != this.latestUpdatingTitleRequsetedAt) { return }
        this.onTitleUpdated()
        break
      case 'title_duplicated':
        if (data['requested_at'] != this.latestUpdatingTitleRequsetedAt) { return }
        this.onTitleDuplicated(data['data']['duplicated_title'])
        break
      case 'blocks_updated':
        if (data['requested_at'] != this.latestUpdatingBlocksRequsetedAt) { return }
        this.onBlocksUpdated()
        break
      default:
        throw 'InvalidEvent'
    }
  }

  public updateTitleLater(
    title: string,
    updatedHandler,
    duplicatedHandler,
  ) {
    this.onTitleUpdated = updatedHandler
    this.onTitleDuplicated = duplicatedHandler

    if (this.updatingTitleDebouncer) {
      clearTimeout(this.updatingTitleDebouncer)
    }

    this.updatingTitleDebouncer = window.setTimeout(
      () => { this.updateTitle(title) },
      DEBOUNCE_DURATION
    )
  }

  private updateTitle(title: string) {
    this.latestUpdatingTitleRequsetedAt = Date.now()
    this.channel.perform('update_title', {
      note: {
        id: this.id,
        title: title
      },
      requested_at: this.latestUpdatingTitleRequsetedAt
    })
  }

  public updateBlocksLater(
    blocks: JSON[],
    updatedHandler,
  ) {
    this.onBlocksUpdated = updatedHandler

    if (this.updatingBlocksDebouncer) {
      clearTimeout(this.updatingBlocksDebouncer)
    }

    this.updatingBlocksDebouncer = window.setTimeout(
      () => { this.updateBlocks(blocks) },
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
