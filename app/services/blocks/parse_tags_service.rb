class Blocks::ParseTagsService
  def initialize block
    @block = block
  end

  def perform!
    tmp_tags = []

    parse_tags_from_node @block.paragraph, tmp_tags

    @block.update! tags: tmp_tags.compact.uniq
  end

  private

  # recursively
  def parse_tags_from_node node, tmp_tags
    case
    when node['type'] == 'tag'
      tmp_tags << node['attrs']['tag']
    when nodes = node['content']
      nodes.each do |sub_node|
        parse_tags_from_node sub_node, tmp_tags
      end
    end
  end
end
