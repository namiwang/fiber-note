Rails.application.routes.draw do
  resources :notes, only: [:new, :edit]

  resource :network, only: [:show], controller: 'network'

  root to: 'notes#new'
end
