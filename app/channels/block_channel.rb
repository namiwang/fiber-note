class BlockChannel < ApplicationCable::Channel
  def subscribed
    stream_for Block.find params[:id]
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  # block:
  #   id:
  #   content: {type: 'paragraph', attrs:, conrtent: [...]}
  def update data
    block = Block.find data['block']['id']
    block.update! content: data['block']['content']

    broadcast_to block, { event: 'updated', requested_at: data['requested_at'] }
  end
end
