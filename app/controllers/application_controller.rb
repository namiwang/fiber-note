class ApplicationController < ActionController::Base
  before_action :enforce_login

  private
 
  def enforce_login
    redirect_to new_session_path unless cookies.encrypted[:session_created]
  end
end
