# TODO PERFORMANCE
# current, we rely on block's callback to parse and update tags
# which leads to another round of database commands
class Blocks::UpdateTagsService
  def initialize old_tag, new_tag
    @old_tag = old_tag
    @new_tag = new_tag
  end

  def perform!
    ActiveRecord::Base.transaction do
      Block.with_any_tags(@old_tag).find_each do |block|
        block.update_tags_in_paragraph! @old_tag, @new_tag
      end
    end
  end
end
