import consumer from "../channels/consumer"

const DEBOUNCE_DURATION = 200

export default class Note {
  private channel

  private latestUpdatingTitleRequsetedAt: number
  private latestUpdatingBlocksRequsetedAt: number
  private updatingTitleDebouncer: number
  private updatingBlocksDebouncer: number

  private onTitleUpdatedOk: () => void
  private onTitleUpdatedConflict: (string) => void
  private onBlocksUpdated: () => void

  constructor(
    private id: string,
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
      case 'title_updated_ok':
        if (data['requested_at'] != this.latestUpdatingTitleRequsetedAt) { return }
        this.onTitleUpdatedOk()
        break;
      case 'title_updated_conflict':
        if (data['requested_at'] != this.latestUpdatingTitleRequsetedAt) { return }
        this.onTitleUpdatedConflict(data['conflicted_title'])
        break;
      case 'blocks_updated':
        if (data['requested_at'] != this.latestUpdatingBlocksRequsetedAt) { return }
        this.onBlocksUpdated()
        break;
      default:
        break;
    }
  }

  public updateTitleLater(
    title: string,
    updatedOkHandler,
    updatedConflictHandler
  ) {
    this.onTitleUpdatedOk = updatedOkHandler
    this.onTitleUpdatedConflict = updatedConflictHandler

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
