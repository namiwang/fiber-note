Rails.application.routes.draw do
  resources :notes, only: [:new, :edit, :update] do
    resource :title, only: [:update], controller: 'notes/title'
  end

  resource :network, only: [:show], controller: 'network'

  root to: 'notes#new'
end
