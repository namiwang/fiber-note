class NoteChannel < ApplicationCable::Channel
  def subscribed
    stream_for find_or_initialize_note params[:note_id]
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def update_title data
    note = find_or_initialize_note data['note']['id']

    title = data['note']['title']

    # the same note
    if note.title == title
      broadcast_to note, { event: 'title_updated_ok', requested_at: data['requested_at'] }
      return
    end

    # duplicate title
    # TODO PERFORMANCE
    if  Note.where(title: title).exists? ||
        Block.with_any_tags(title).exists?
      broadcast_to note, { event: 'title_updated_conflict', conflicted_title: title, requested_at: data['requested_at'] }
      return
    end

    note.update! title: title
    broadcast_to note, { event: 'title_updated_ok', requested_at: data['requested_at'] }
  end

  def update_blocks data
    note = find_or_initialize_note data['note']['id']

    new_blocks = data['note']['blocks']

    new_blocks.each do |block|
      create_or_update_block! note, block
    end

    note.update! ordered_block_ids: new_blocks.map{|b| b['attrs']['block_id'] }

    note.clear_dangling_blocks!

    broadcast_to note, { event: 'blocks_updated', requested_at: data['requested_at'] }
  end

  # TODO move to block channel
  def update_block data
    note = Note.find data['note']['id']
    block = note.blocks.find_by! id: data['note']['block']['id']

    block_content = data['note']['block']['content']

    block.update! content: block_content

    broadcast_to note, { event: 'block_updated', requested_at: data['requested_at'] }
  end

  private

  def find_or_initialize_note id
    Note.find_or_initialize_by id: id
  end

  def create_or_update_block! note, block_data
    id = block_data['attrs']['block_id']
    content = block_data

    block = note.blocks.find_or_initialize_by id: id
    block.update! content: content
  end
end
