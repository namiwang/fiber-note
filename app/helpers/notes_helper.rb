module NotesHelper
  def new_note_from_tag_path tag
    new_note_path title: tag
  end
end
