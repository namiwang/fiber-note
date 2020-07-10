class Notes::EditorComponent < ViewComponent::Base
  def initialize block
    mode = if block.is_note then :note else :block end

    note, focusing_block = if mode == :note
      [block, nil]
    else
      [block.root_note, block]
    end

    @editor_data = {
      mode: mode,
      note: {
        id: note.id,
        title: note.title,
        content: BlockSerializer.new(note, focusing_block).as_note_doc.to_json,
      },
      available_tags: Block.available_tags,
    }
  end
end
