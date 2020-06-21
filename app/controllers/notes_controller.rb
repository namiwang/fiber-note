class NotesController < ApplicationController
  def index
    @notes = Note.all
  end

  def new
    # TODO HACK
    # kind of a hack
    # prosemirror doesn't allow empty text node
    @note = Note.new(id: SecureRandom.uuid, title: 'untitled')

    @available_tags = Note.distinct.pluck(:title)

    render :edit
  end

  def edit
    @note = Note.find params[:id]
    @available_tags = Note.distinct.pluck(:title)
  end

  def update
    @note = Note.find_or_initialize_by(id: params[:id])

    new_blocks = params[:note][:blocks]

    new_blocks.each do |block|
      create_or_update_block! block
    end

    ordered_block_ids = new_blocks.map{|b| b[:attrs][:block_id] }
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

  def create_or_update_block! params
    id = params[:attrs][:block_id]
    content = params.permit!.to_h

    block = @note.blocks.find_or_initialize_by id: id
    block.update! content: content
  end
end
