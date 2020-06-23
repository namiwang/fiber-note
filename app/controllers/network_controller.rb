class NetworkController < ApplicationController
  def show
    @graph_nodes = []
    @graph_edges = []

    Note.find_each do |note|
      @graph_nodes << { data: { type: 'note', id: note.title, href: edit_note_path(note) } }
    end

    no_note_tags = Block.all_tags - Note.pluck(:title)
    no_note_tags.each do |tag|
      @graph_nodes << { data: { type: 'no_note_tag', id: tag, href: new_note_by_tag_path(tag) } }
    end

    Block.find_each do |block|
      block.tags.each do |tag|
        @graph_edges << { data: { source: block.note.title, target: tag } }
      end
    end
  end
end
