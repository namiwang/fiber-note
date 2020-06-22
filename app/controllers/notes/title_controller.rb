class Notes::TitleController < ApplicationController
  def update
    @note = Note.find_or_initialize_by(id: params[:note_id])

    title = params[:note][:title]

    if @note.title == title
      head :ok and return
    end

    if Note.where(title: title).exists?
      head :conflict and return
    end

    @note.update! title: title
  end
end
