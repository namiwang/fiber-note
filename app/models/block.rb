# == Schema Information
#
# Table name: blocks
#
#  id              :uuid             not null, primary key
#  child_block_ids :uuid             default([]), not null, is an Array
#  paragraph       :jsonb            not null
#  tags            :string           default([]), not null, is an Array
#  title           :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  parent_id       :uuid
#
# Indexes
#
#  index_blocks_on_child_block_ids  (child_block_ids) USING gin
#  index_blocks_on_parent_id        (parent_id)
#  index_blocks_on_tags             (tags) USING gin
#  index_blocks_on_title            (title) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => blocks.id)
#
class Block < ApplicationRecord
  belongs_to :parent, class_name: 'Block', optional: true

  before_destroy :destroy_descendants! # expect to destroy recursively

  # TODO
  # - async
  # - service
  # - if changed
  after_save :clear_dangling_blocks!

  # 
  # tags
  # 

  taggable_array :tags

  after_save :parse_tags!, if: :saved_change_to_paragraph?

  def parse_tags!
    Blocks::ParseTagsService.new(self).perform!
  end

  scope :notes, -> { where.not(title: nil) }

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

  # `dangling blocks` i.e. blocks not in child_block_ids anymore
  def clear_dangling_blocks!
    # TODO PERFORMANCE
    # optimize via sql
    # 
    # NOTE is this an active record issue?
    # 
    # > @note.blocks.where.not(id: child_block_ids).destroy_all
    # does not work

    # NOTE not using #child_blocks, to not wasting performance for ordering
    Block.where(parent: self).find_each do |b|
      unless child_block_ids.include? b.id
        b.destroy!
      end
    end
  end

  # node as in fragment for editor, without the `doc` wrapper, like
  # {type: paragraph, content: [{type: text, content: 'foo'}]}
  # 
  # TODO move rendering related to helper/decorator/components
  # 
  def to_list_item_node
    content = [paragraph]

    if !child_blocks.empty?
      content << {
        type: 'bullet_list',
        content: child_blocks.map(&:to_list_item_node)
      }
    end

    doc = {
      type: 'list_item',
      content: content
    }

    doc
  end

  def to_note_doc
    title_node = if title
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

    content = [title_node]

    if !child_blocks.empty?
      content << {
        type: 'bullet_list',
        content: child_blocks.map(&:to_list_item_node)
      }
    end

    doc = {
      type: 'doc',
      content: content
    }

    doc
  end
end
