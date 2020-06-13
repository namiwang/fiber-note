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
require 'rails_helper'

RSpec.describe Note, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
