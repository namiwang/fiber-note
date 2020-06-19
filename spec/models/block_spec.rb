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
require 'rails_helper'

RSpec.describe Block, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
