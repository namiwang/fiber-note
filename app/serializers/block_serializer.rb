# == Schema Information
#
# Table name: blocks
#
#  id              :uuid             not null, primary key
#  child_block_ids :uuid             default([]), not null, is an Array
#  is_note         :boolean          default(FALSE), not null
#  paragraph       :jsonb            not null
#  tags            :string           default([]), not null, is an Array
#  title           :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  parent_id       :uuid
#  root_note_id    :uuid
#
# Indexes
#
#  index_blocks_on_child_block_ids  (child_block_ids) USING gin
#  index_blocks_on_is_note          (is_note)
#  index_blocks_on_parent_id        (parent_id)
#  index_blocks_on_root_note_id     (root_note_id)
#  index_blocks_on_tags             (tags) USING gin
#  index_blocks_on_title            (title) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => blocks.id)
#  fk_rails_...  (root_note_id => blocks.id)
#

class BlockSerializer
  # if focusing_block exists,
  # add attr hidden: true to all other blocks
  def initialize block, focusing_block
    @block = block
    @focusing_block = focusing_block
  end

  def as_note_doc
    title_node = if @block.title
      {
        type: 'h1',
        content: [
          {
            type: 'text',
            text: @block.title
          }
        ]
      }
    else
      {
        type: 'h1',
        content: []
      }
    end

    content = [title_node]

    if !@block.child_blocks.empty?
      content << {
        type: 'bullet_list',
        content: @block.child_blocks.map{ |block|
          as_list_item_node block, (@focusing_block && @focusing_block != block)
        }
      }
    end

    {
      type: 'doc',
      content: content
    }
  end

  private

  # node as in fragment for editor, without the `doc` wrapper, like
  # {type: paragraph, content: [{type: text, content: 'foo'}]}
  # 
  def as_list_item_node block, hidden = false
    content = [block.paragraph]

    if !block.child_blocks.empty?
      content << {
        type: 'bullet_list',
        content: block.child_blocks.map{ |child_block|
          as_list_item_node child_block
        }
      }
    end

    doc = {
      type: 'list_item',
      attrs: {
        block_id: block.id,
        hidden: hidden,
      },
      content: content,
    }

    doc
  end

end
