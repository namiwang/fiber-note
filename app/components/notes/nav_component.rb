class Notes::NavComponent < ViewComponent::Base
  def initialize notes:
    @notes = notes
  end
end
