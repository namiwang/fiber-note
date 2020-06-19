class AllowDuplicatedTitleOnNote < ActiveRecord::Migration[6.0]
  def change
    remove_index :notes, :title
    add_index :notes, :title
  end
end
