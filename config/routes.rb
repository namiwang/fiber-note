Rails.application.routes.draw do
  get "notes(/:title)", to: 'notes#show', as: :note

  resource :network, only: [:show], controller: 'network'

  root to: 'notes#show'
end
