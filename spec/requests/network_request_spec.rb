require 'rails_helper'

RSpec.describe "Networks", type: :request do

  describe "GET /show" do
    it "returns http success" do
      get "/network/show"
      expect(response).to have_http_status(:success)
    end
  end

end
