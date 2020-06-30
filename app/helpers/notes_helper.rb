module NotesHelper
  def available_tags
    # TODO
    # - titles
    # - PERFORMANCE
    Block.all_tags
  end

  def new_note_from_tag_path tag
    new_note_path title: tag
  end
end
