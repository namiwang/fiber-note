require 'rails_helper'

RSpec.describe "Networks" do

  describe "GET /network" do
    it "returns http success" do
      get "/network"
      expect(response).to have_http_status(:success)
    end
  end

end
