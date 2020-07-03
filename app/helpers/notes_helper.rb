module NotesHelper
  def available_tags
    # TODO
    # - titles
    # - PERFORMANCE
    Block.all_tags
  end
end
