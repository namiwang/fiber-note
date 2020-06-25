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

  def update
    @note = Note.find_or_initialize_by(id: params[:id])

    new_blocks = JSON.parse params[:note][:blocks]

    new_blocks.each do |block|
      create_or_update_block! block
    end

    ordered_block_ids = new_blocks.map{|b| b['attrs']['block_id'] }
    @note.update! ordered_block_ids: ordered_block_ids

    # TODO NOTE is this an active record issue?
    # @note.blocks.where.not(id: ordered_block_ids).destroy_all
    # `.blocks.where.not(id: ids)` is empty, if the there're no ordered
    # ids in the `ids` list
    # actually,
    # `Block.where(note: @note).where.not(id: ids)` is always empty as well,
    # yet `Block.where(note: @note).where(id: ids)` is fine
    @note.blocks.find_each do |b|
      b.destroy unless ordered_block_ids.include?(b.id)
    end
  end

  private

  def list_notes_for_nav
    @notes = Note.all
    @no_note_tags = Block.all_tags - Note.pluck(:title)
  end

  def list_tags_for_editor
    @available_tags = Block.all_tags
  end

  def create_or_update_block! params
    id = params['attrs']['block_id']
    content = params

    block = @note.blocks.find_or_initialize_by id: id
    block.update! content: content
  end
end
