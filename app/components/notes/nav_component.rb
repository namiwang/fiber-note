class Notes::NavComponent < ViewComponent::Base
  def initialize
    @available_tags = Block.available_tags
  end
end
