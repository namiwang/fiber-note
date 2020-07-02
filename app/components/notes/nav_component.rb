class Notes::NavComponent < ViewComponent::Base
  def initialize notes:, no_note_tags:
    @notes = notes
    @no_note_tags = no_note_tags
  end
end
