class SessionController < ApplicationController
  def new
  end

  def create
    def create
      if ActiveSupport::SecurityUtils::secure_compare(
        params[:session][:password],
        ENV['PASSWORD']
      )
        session[:session] = true
        redirect_to root_path
      else
        flash[:error] = "authentication failed"

        redirect_back fallback_location: root_path
      end
    end
  end
end
