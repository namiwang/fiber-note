class NoteChannel < ApplicationCable::Channel
  def subscribed
    stream_for find_or_create_note! params[:id]
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  # data:
  #   note:
  #     id
  #     title
  def update_title data
    note = find_or_create_note! data['note']['id']

    title = data['note']['title']

    note.update! title: title

    broadcast_to note, { event: 'title_updated', requested_at: data['requested_at'] }

    # TODO another note with duplicate title
  end

  # data:
  #   note:
  #     id
  #     blocks:
  #       [
  #         
  #       ]
  def update_blocks data
    note = find_or_create_note! data['note']['id']

    child_blocks = data['note']['blocks']

    child_blocks.each do |block|
      Block.create_or_update_from_doc! block, note
    end

    note.update! child_block_ids: child_blocks.map{|b| b['attrs']['block_id'] }

    broadcast_to note, { event: 'blocks_updated', requested_at: data['requested_at'] }
  end

  private

  # NOTE find_or_initialize may be faster yet it leads to concurrent issue
  def find_or_create_note! id
    Block.find_by(id: id) || Block.create!(
      id: id,
      is_note: true,
    )
  end

end
