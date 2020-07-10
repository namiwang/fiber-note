# == Schema Information
#
# Table name: blocks
#
#  id              :uuid             not null, primary key
#  child_block_ids :uuid             default([]), not null, is an Array
#  is_note         :boolean          default(FALSE), not null
#  paragraph       :jsonb            not null
#  tags            :string           default([]), not null, is an Array
#  title           :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  parent_id       :uuid
#  root_note_id    :uuid
#
# Indexes
#
#  index_blocks_on_child_block_ids  (child_block_ids) USING gin
#  index_blocks_on_is_note          (is_note)
#  index_blocks_on_parent_id        (parent_id)
#  index_blocks_on_root_note_id     (root_note_id)
#  index_blocks_on_tags             (tags) USING gin
#  index_blocks_on_title            (title) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => blocks.id)
#  fk_rails_...  (root_note_id => blocks.id)
#
class Block < ApplicationRecord
  # 
  # associations
  # 
  belongs_to :parent, class_name: 'Block', optional: true
  belongs_to :root_note, class_name: 'Block', optional: true

  before_destroy :destroy_descendants! # expect to destroy recursively

  def destroy_descendants!
    child_blocks.each(&:destroy!)
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

  # from self to root, including self and root
  def ancestor_ids
    current_block = self
    ids = []

    loop do
      ids << current_block.id
      break unless current_block = current_block.parent
    end

    ids
  end

  # TODO
  # - async
  # - service
  after_save :clear_dangling_blocks!, if: :saved_change_to_child_block_ids?

  # 
  # tags
  # 

  taggable_array :tags

  after_save :parse_tags!, if: :saved_change_to_paragraph?

  def parse_tags!
    Blocks::ParseTagsService.new(self).perform!
  end

  # 
  # update notes/nav_channel
  # 

  after_commit -> { Block.refresh_notes_nav }, on: :update, if: :saved_change_to_tags?
  # TODO after_destroy -> { Block.refresh_notes_nav }, if: :is_note

  def self.refresh_notes_nav
    ActionCable.server.broadcast(
      'notes/nav_channel',
      { event: 'notes_updated' }
    )
  end

  # 
  # notes
  # 

  scope :notes, -> { where(is_note: true) }
  scope :not_notes, -> { where(is_note: false) }

  # TODO
  # DEPRECATION WARNING:
  # Class level methods will no longer inherit scoping from `create` in Rails 6.1.
  # To continue using the scoped relation, pass it into the block directly.
  # To instead access the full set of models, as Rails 6.1 will, use `Block.default_scoped`.
  def self.available_tags
    (all_tags + notes.pluck(:title)).uniq
  end

  # TODO make it a service
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
end
