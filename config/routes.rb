Rails.application.routes.draw do
  resources :notes, only: [:index, :new, :edit, :update] do
    resource :title, only: [:update], controller: 'notes/title'
  end

  root to: 'notes#index'
end
