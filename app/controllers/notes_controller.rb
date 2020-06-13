class NotesController < ApplicationController
  def new
    @note = Note.new
    render :edit
  end

  def edit
  end
end
