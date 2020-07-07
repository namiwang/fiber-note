class NotesController < ApplicationController
  def show
    @note = Block.notes.find_by(title: params[:title]) ||
      Block.new(
        id: SecureRandom.uuid,
        is_note: true,
        title: params[:title]
      )

    # TODO
    # - exclude current note
    # - group by note
    @linked_blocks = Block.with_any_tags @note.title
  end
end
