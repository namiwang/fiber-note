import consumer from "./consumer"

export default function constructNodeChannel(noteId: string) {
  return consumer.subscriptions.create({
    channel: 'NoteChannel',
    note_id: noteId
  }, {
    connected() {
      console.log('noteChannel:connected')
    },

    disconnected() {
      console.log('noteChannel:disconnected')
    },

    received(data) {
      console.log('noteChannel:receive data:')
      console.log(data)
    },

    updateBlocks(noteId: string, blocks: JSON[]) {
      this.perform('update_blocks', {
        note: {
          id: noteId,
          blocks: blocks
        },
        requested_at: Date.now()
      })
    }
  })
}
