# recursively create all nested blocks
# 
# doc: 
#   {"type"=>"list_item",
#     "attrs"=>{"block_id"=>"b4989f1a-fcd3-4d83-9b81-c38dace4f617"},
#     "content"=>
#      [{"type"=>"paragraph", "content"=>[{"type"=>"text", "text"=>"a"}]},
#       {"type"=>"bullet_list",
#        "content"=>
#         [{"type"=>"list_item",
#           "attrs"=>{"block_id"=>"b4989f1a-fcd3-4d83-9b81-c38dace4f617"},
#           "content"=>
#            [{"type"=>"paragraph",
#              "content"=>[{"type"=>"text", "text"=>"b"}]}]}]}]}]},
# 

class Blocks::CreateOrUpdateService
  def initialize doc, root_note
    @doc = doc
    @root_note = root_note
  end

  def perform!
    create_or_update_block! @doc, @root_note
  end

  private

  def create_or_update_block! doc, parent
    id = doc['attrs']['block_id']
    block = Block.find_or_initialize_by id: id

    block.parent = parent
    block.root_note = @root_note
    block.paragraph = doc['content'].first

    child_block_ids = []
    if nesting_list = doc['content'].second
      child_blocks = nesting_list['content']
      child_blocks.each do |child_block_doc|
        child_block = create_or_update_block! child_block_doc, block
        child_block_ids << child_block.id
      end
    end

    block.child_block_ids = child_block_ids

    block.save!
    block
  end
end
