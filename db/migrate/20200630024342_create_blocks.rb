class CreateBlocks < ActiveRecord::Migration[6.0]
  def change
    create_table :blocks, id: :uuid do |t|
      t.jsonb :paragraph, null: false, default: {}
      t.string :tags, null: false, array: true, default: [], index: {using: :gin}

      # associations
      t.references :parent, type: :uuid, null: true, foreign_key: {to_table: :blocks}
      t.references :root_note, type: :uuid, null: true, foreign_key: {to_table: :blocks}
      t.uuid :child_block_ids, null: false, array: true, default: [], index: {using: :gin}

      # note
      t.boolean :is_note, null: false, index: true
      t.string :title, null: true, index: {unique: true}

      t.timestamps
    end
  end
end
