class NotesController < ApplicationController
  def show
    @note = Block.notes.find_by(title: params[:title]) ||
      Block.new(
        id: SecureRandom.uuid,
        title: params[:title]
      )

    @notes = (Block.all_tags + Block.notes.pluck(:title)).uniq
  end
end
