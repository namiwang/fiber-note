# == Schema Information
#
# Table name: blocks
#
#  id         :uuid             not null, primary key
#  content    :jsonb            not null
#  tags       :string           default([]), is an Array
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  note_id    :uuid             not null
#
# Indexes
#
#  index_blocks_on_note_id  (note_id)
#  index_blocks_on_tags     (tags) USING gin
#
# Foreign Keys
#
#  fk_rails_...  (note_id => notes.id)
#
class Block < ApplicationRecord
  belongs_to :note
  taggable_array :tags

  after_save :parse_tags

  def as_doc_json
    {
      type: 'doc',
      content: [content]
    }.to_json
  end

  private

  # TODO failing when updating single block
  def parse_tags
    tmp_tags = []

    parse_tags_from_node self.content, tmp_tags

    update_column :tags, tmp_tags.compact.uniq
  end

  def parse_tags_from_node node, tmp_tags
    case
    when node['type'] == 'tag'
      tmp_tags << node['attrs']['tag']
    when nodes = node['content']
      nodes.each do |sub_node|
        parse_tags_from_node sub_node, tmp_tags
      end
    end

    tmp_tags
  end
end
