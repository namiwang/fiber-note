class Notes::EditorComponent < ViewComponent::Base
  def initialize block
    mode = if block.is_note then :note else :block end

    note = if mode == :note then block else block.root_note end

    @editor_data = {
      mode: mode,
      note: {
        id: note.id,
        title: note.title,
        content: BlockSerializer.new(note).as_note_doc.to_json,
      },
      available_tags: Block.available_tags,
    }

    if mode == :block
      @editor_data[:hidden_block_ids] = note.child_block_ids - [note.id]
    end
  end
end
