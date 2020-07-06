class Notes::NavChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'notes/nav_channel'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def request_partial data
    current_note = Block.find data['current_note_id']

    ActionCable.server.broadcast(
      'notes/nav_channel',
      {
        event: 'partial_rendered',
        partial: ApplicationController.renderer.render(
          Notes::NavComponent.new(
            current_note
          )
        )
      }
    )
  end
end
