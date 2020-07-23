require 'rails_helper'

RSpec.describe "Networks" do

  describe "GET /network" do
    it 'redirects to session#create without a session' do
      get '/network'
      expect(response).to have_http_status(:redirect)
    end

    pending 'returns http success with a session'
  end

end
