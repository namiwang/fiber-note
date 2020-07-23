module ApplicationCable
  class Connection < ActionCable::Connection::Base
    def connect
      reject_unauthorized_connection unless cookies.encrypted[:session_created]
    end
  end
end
