class ApplicationController < ActionController::Base
  def new_note_by_tag_path tag
    new_note_path title: tag
  end
end
