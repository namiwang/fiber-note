class Notes::NavComponent < ViewComponent::Base
  def initialize current_note
    @note_titles = Block.available_tags
    @current_note = current_note
  end
end
