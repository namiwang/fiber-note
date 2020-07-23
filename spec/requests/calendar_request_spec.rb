require 'rails_helper'

RSpec.describe "Calendars" do

  describe "GET /calendar" do
    it 'redirects to session#create without a session' do
      get '/calendar'
      expect(response).to have_http_status(:redirect)
    end

    pending 'returns http success with a session'
  end

end
