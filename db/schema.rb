# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_06_30_024342) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "blocks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "paragraph", default: {}, null: false
    t.string "tags", default: [], null: false, array: true
    t.uuid "parent_id"
    t.uuid "child_block_ids", default: [], null: false, array: true
    t.boolean "is_note", default: false, null: false
    t.string "title"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["child_block_ids"], name: "index_blocks_on_child_block_ids", using: :gin
    t.index ["is_note"], name: "index_blocks_on_is_note"
    t.index ["parent_id"], name: "index_blocks_on_parent_id"
    t.index ["tags"], name: "index_blocks_on_tags", using: :gin
    t.index ["title"], name: "index_blocks_on_title"
  end

  add_foreign_key "blocks", "blocks", column: "parent_id"
end
