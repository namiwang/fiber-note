# == Schema Information
#
# Table name: notes
#
#  id         :uuid             not null, primary key
#  title      :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_notes_on_title  (title) UNIQUE
#
class Note < ApplicationRecord
  has_many :blocks

  def content_json
    doc = {
      type: 'doc',
      content: [
        {
          type: 'h1',
          content: [
            {
              type: 'text',
              text: title
            }
          ]
        }
      ] + blocks.map(&:content)
    }

    doc.to_json
  end
end
