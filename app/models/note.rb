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
end
