class NotesController < ApplicationController
  before_action :list_notes_for_nav, only: [:new, :edit]

  def new
    @note = Block.notes.new(
      id: SecureRandom.uuid,
      is_note: true,
      title: params[:title]
    )

    # @linked_blocks = if @note.title.blank?
    #   []
    # else
    #   Block.with_any_tags(@note.title)
    # end

    render :edit
  end

  def edit
    @note = Block.notes.find params[:id]
    # @linked_blocks = Block.with_any_tags(@note.title)
  end

  # private

  def list_notes_for_nav
    @notes = Block.notes
    @no_note_tags = Block.all_tags - Block.notes.pluck(:title)
  end
end
