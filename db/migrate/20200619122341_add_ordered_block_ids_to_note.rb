class AddOrderedBlockIdsToNote < ActiveRecord::Migration[6.0]
  def change
    add_column :notes, :ordered_block_ids, :uuid, null: false, array: true, default: []
  end
end
