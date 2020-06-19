# == Schema Information
#
# Table name: blocks
#
#  id         :uuid             not null, primary key
#  content    :jsonb            not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  note_id    :uuid             not null
#
# Indexes
#
#  index_blocks_on_note_id  (note_id)
#
# Foreign Keys
#
#  fk_rails_...  (note_id => notes.id)
#
class Block < ApplicationRecord
  belongs_to :note
end
