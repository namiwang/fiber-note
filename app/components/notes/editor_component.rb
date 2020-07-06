class Notes::EditorComponent < ViewComponent::Base
  def initialize block
    note = if block.is_note? then block else block.root_note end

    @editor_data = {
      note: {
        id: note.id,
        title: note.title,
        content: BlockSerializer.new(note).as_note_doc.to_json,
      },
      available_tags: Block.available_tags,
    }

    # in linked block
    # TODO better naming
    if block.is_note?
      @editor_data[:hidden_block_ids] = note.child_block_ids - [note.id]
    end
  end
end
