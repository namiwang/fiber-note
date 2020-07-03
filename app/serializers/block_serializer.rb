# TODO
# methods could be improved

class BlockSerializer
  def initialize block
    @block = block
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
          as_list_item_node block
        }
      }
    end

    doc = {
      type: 'doc',
      content: content
    }

    doc
  end

  private

  # node as in fragment for editor, without the `doc` wrapper, like
  # {type: paragraph, content: [{type: text, content: 'foo'}]}
  # 
  def as_list_item_node block
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
      content: content
    }

    doc
  end

end
