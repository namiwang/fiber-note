class NotesController < ApplicationController
  def show
    @note = Block.notes.find_by(title: params[:title]) ||
      Block.new(
        id: SecureRandom.uuid,
        title: params[:title]
      )
  end
end
