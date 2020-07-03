class NetworkController < ApplicationController
  include NotesHelper

  def show
    @graph_nodes = []
    @graph_edges = []

    Note.find_each do |note|
      @graph_nodes << { data: {
        id: note.title, href: edit_note_path(note)
      } }
    end

    no_note_tags = Block.all_tags - Note.pluck(:title)
    no_note_tags.each do |tag|
      @graph_nodes << { data: {
        id: tag, href: new_note_path(title: tag)
      } }
    end

    Block.find_each do |block|
      block.tags.each do |tag|
        @graph_edges << { data: { source: block.note.title, target: tag } }
      end
    end
  end
end
