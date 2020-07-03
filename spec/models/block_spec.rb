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
require 'rails_helper'

RSpec.describe Block, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
