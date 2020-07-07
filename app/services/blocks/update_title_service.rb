# TODO
# - duplicate title
# - trigger update nav
# - update existing tags
class Blocks::UpdateTitleService
  def initialize block, new_title
    @note = block
    raise 'NotANote' unless @note.is_note

    @ori_title = @note.title
    @new_title = new_title
  end

  def perform!
    ActiveRecord::Base.transaction do
      @note.update! title: @new_title
    end

    # TODO async
    Block.refresh_notes_nav
  end
end
