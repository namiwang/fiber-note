class NotesController < ApplicationController
  before_action :list_notes_for_nav, only: [:new, :edit]
  before_action :list_tags_for_editor, only: [:new, :edit]

  def new
    # TODO let's believe uuid wont conflict for now
    @note = Note.new(id: SecureRandom.uuid, title: params[:title])
    @linked_blocks = if @note.title.blank?
      []
    else
      Block.with_any_tags(@note.title)
    end

    render :edit
  end

  def edit
    @note = Note.find params[:id]
    @linked_blocks = Block.with_any_tags(@note.title)
  end

  private

  def list_notes_for_nav
    @notes = Note.all
    @no_note_tags = Block.all_tags - Note.pluck(:title)
  end

  def list_tags_for_editor
    @available_tags = Block.all_tags
  end
end
