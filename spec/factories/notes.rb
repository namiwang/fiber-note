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
#  index_notes_on_title  (title)
#
FactoryBot.define do
  factory :note do
    title { "MyString" }
  end
end
