# == Schema Information
#
# Table name: blocks
#
#  id              :uuid             not null, primary key
#  child_block_ids :uuid             default([]), not null, is an Array
#  is_note         :boolean          default(FALSE), not null
#  paragraph       :jsonb            not null
#  tags            :uuid             default([]), not null, is an Array
#  title           :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  parent_id       :uuid
#
# Indexes
#
#  index_blocks_on_child_block_ids  (child_block_ids) USING gin
#  index_blocks_on_is_note          (is_note)
#  index_blocks_on_parent_id        (parent_id)
#  index_blocks_on_tags             (tags) USING gin
#  index_blocks_on_title            (title)
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => blocks.id)
#
class Block < ApplicationRecord
  belongs_to :parent, class_name: 'Block', optional: true

  before_destroy :destroy_descendants! # expect to destroy recursively

  taggable_array :tags

  scope :notes, -> { where(is_note: true) }

  # recursively create all nested blocks
  # 
  # doc: 
  #   {"type"=>"list_item",
  #     "attrs"=>{"block_id"=>"b4989f1a-fcd3-4d83-9b81-c38dace4f617"},
  #     "content"=>
  #      [{"type"=>"paragraph", "content"=>[{"type"=>"text", "text"=>"a"}]},
  #       {"type"=>"bullet_list",
  #        "content"=>
  #         [{"type"=>"list_item",
  #           "attrs"=>{"block_id"=>"b4989f1a-fcd3-4d83-9b81-c38dace4f617"},
  #           "content"=>
  #            [{"type"=>"paragraph",
  #              "content"=>[{"type"=>"text", "text"=>"b"}]}]}]}]}]},
  def self.create_or_update_from_doc! doc, parent
    id = doc['attrs']['block_id']
    block = Block.find_or_initialize_by id: id

    block.parent = parent
    block.paragraph = doc['content'].first

    child_block_ids = []
    if nesting_list = doc['content'].second
      child_blocks = nesting_list['content']
      child_blocks.each do |child_block_doc|
        child_block = Block.create_or_update_from_doc! child_block_doc, block
        child_block_ids << child_block.id
      end
    end

    block.child_block_ids = child_block_ids

    block.save!
    block
  end

  def child_blocks
    # TODO PERFORMANCE
    # 
    # blocks = Block.where(id: ordered_block_ids).map(&:content)
    # NOTE
    # simply `Block.where(id: ordered_block_ids)` will NOT preserve the order of id
    # https://stackoverflow.com/questions/866465/order-by-the-in-value-list
    # 
    child_block_ids.map(&Block.method(:find))
  end

  def destroy_descendants!
    child_blocks.each(&:destroy!)
  end

  #   # `dangling blocks` i.e. not in ordered_block_ids
  #   def clear_dangling_blocks!
  #     # TODO NOTE is this an active record issue?
  #     # @note.blocks.where.not(id: ordered_block_ids).destroy_all
  #     # `.blocks.where.not(id: ids)` is empty, if the there're no ordered
  #     # ids in the `ids` list
  #     # actually,
  #     # `Block.where(note: @note).where.not(id: ids)` is always empty as well,
  #     # yet `Block.where(note: @note).where(id: ids)` is fine
  #     blocks.find_each do |b|
  #       b.destroy unless ordered_block_ids.include?(b.id)
  #     end
  #   end

  #   # TODO failing when updating single block
  #   def parse_tags
  #     tmp_tags = []
  # 
  #     parse_tags_from_node self.content, tmp_tags
  # 
  #     update_column :tags, tmp_tags.compact.uniq
  #   end
  # 
  #   def parse_tags_from_node node, tmp_tags
  #     case
  #     when node['type'] == 'tag'
  #       tmp_tags << node['attrs']['tag']
  #     when nodes = node['content']
  #       nodes.each do |sub_node|
  #         parse_tags_from_node sub_node, tmp_tags
  #       end
  #     end
  # 
  #     tmp_tags
  #   end

  def to_doc
    paragraph_or_title = if is_note
      if title
        {
          type: 'h1',
          content: [
            {
              type: 'text',
              text: title
            }
          ]
        }
      else
        {
          type: 'h1',
          content: []
        }
      end
    else
      paragraph
    end

    doc = {
      type: 'doc',
      content: [paragraph_or_title] + child_blocks.map(&:to_doc)
    }

    doc
  end
end
