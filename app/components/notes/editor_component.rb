class Notes::EditorComponent < ViewComponent::Base
  def initialize block
    mode = if block.is_note? then :note else :block end

    @editor_data = {
      mode: mode,
      note: {
        id: block.id,
        title: block.title,
        content: BlockSerializer.new(block).as_note_doc.to_json,
      },
      available_tags: Block.available_tags,
    }

    if mode == :block
      @editor_data[:hidden_block_ids] = block.child_block_ids - [block.id]
    end

  end
end
