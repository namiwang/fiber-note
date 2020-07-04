class NetworkController < ApplicationController
  def show
    @nodes = Block.available_tags.map do |tag|
      {
        data: {
          id: tag, href: note_path(tag)
        }
      }
    end

    @edges = []
    Block.find_each do |block|
      block.tags.each do |tag|
        @edges << { data: {
          source: block.root_note.title,
          target: tag
        } }
      end
    end
  end
end
