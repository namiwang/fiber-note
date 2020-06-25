export default class Note {
  private updateTitleRequestController: AbortController
  private updateBlocksRequestController: AbortController

  constructor(
    private id: string,

    // title used in the last, or current request
    // or the init value
    private title: string,
  ){}

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

  async updateBlocks(blocks: JSON[]) {
    this.updateBlocksRequestController?.abort()
    this.updateBlocksRequestController = new AbortController

    return await this.request(
      `/notes/${this.id}`,
      this.updateBlocksRequestController.signal,
      {note: {blocks: JSON.stringify(blocks)}}
    )
  }
}
