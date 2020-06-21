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

    blocks = Block.where(id: ordered_block_ids).map(&:content)

    doc = {
      type: 'doc',
      content: [title_node] + blocks
    }

    doc.to_json
  end
end
