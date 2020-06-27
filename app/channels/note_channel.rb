class NoteChannel < ApplicationCable::Channel
  def subscribed
    stream_for Note.find_or_initialize_by(id: params[:note_id])
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def update_blocks data
    note = Note.find_or_initialize_by(id: data['note']['id'])

    new_blocks = data['note']['blocks']

    new_blocks.each do |block|
      create_or_update_block! note, block
    end

    note.update! ordered_block_ids: new_blocks.map{|b| b['attrs']['block_id'] }

    note.clear_dangling_blocks!

    broadcast_to note, { event: 'blocks_updated', requested_at: data['requested_at'] }
  end

  private

  def create_or_update_block! note, block_data
    id = block_data['attrs']['block_id']
    content = block_data

    block = note.blocks.find_or_initialize_by id: id
    block.update! content: content
  end
end
