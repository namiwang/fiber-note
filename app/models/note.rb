# == Schema Information
#
# Table name: notes
#
#  id                :uuid             not null, primary key
#  ordered_block_ids :uuid             default([]), not null, is an Array
#  title             :string           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_notes_on_title  (title) UNIQUE
#
class Note < ApplicationRecord
  has_many :blocks, dependent: :destroy

  # `dangling blocks` i.e. not in ordered_block_ids
  def clear_dangling_blocks!
    # TODO NOTE is this an active record issue?
    # @note.blocks.where.not(id: ordered_block_ids).destroy_all
    # `.blocks.where.not(id: ids)` is empty, if the there're no ordered
    # ids in the `ids` list
    # actually,
    # `Block.where(note: @note).where.not(id: ids)` is always empty as well,
    # yet `Block.where(note: @note).where(id: ids)` is fine
    blocks.find_each do |b|
      b.destroy unless ordered_block_ids.include?(b.id)
    end
  end

  def content_json
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

    # blocks = Block.where(id: ordered_block_ids).map(&:content)
    # NOTE
    # simply `Block.where(id: ordered_block_ids)` will NOT preserve the order of id
    # https://stackoverflow.com/questions/866465/order-by-the-in-value-list
    # 
    # TODO PERFORMANCE
    # 
    blocks = ordered_block_ids.map do |b_id|
      Block.find(b_id).content
    end

    doc = {
      type: 'doc',
      content: [title_node] + blocks
    }

    doc.to_json
  end
end
