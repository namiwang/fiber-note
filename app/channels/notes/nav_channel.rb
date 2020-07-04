class Notes::NavChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'notes/nav_channel'
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
