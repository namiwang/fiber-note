import consumer from "./consumer"

export default consumer.subscriptions.create("NoteChannel", {
  connected() {
    console.log('noteChannel connected')
  },

  disconnected() {
    console.log('noteChannel disconnected')
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
  },

  updateBlocks(noteId: string, blocks: JSON[]) {
    this.perform('update_blocks', {
      note: {
        id: noteId,
        blocks: blocks
      }
    })
  }
})
