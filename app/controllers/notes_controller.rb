class NotesController < ApplicationController
  def index
    @notes = Note.all
  end

  def new
    @note = Note.new(id: SecureRandom.uuid)

    render :edit
  end

  def edit
    @note = Note.find params[:id]
  end

  def update
    @note = Note.find_or_initialize_by(id: params[:id])

    case
    when new_title = params[:note][:title]
      # updating title
      if @note.update title: new_title
        head :ok
      else
        head :conflict
      end
    # when new_content = params[:note][:content]
    end
  end
end
