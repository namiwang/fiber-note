class CreateNotes < ActiveRecord::Migration[6.0]
  def change
    create_table :notes, id: :uuid do |t|
      t.string :title, null: false, index: {unique: true}

      t.timestamps
    end
  end
end
