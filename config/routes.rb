Rails.application.routes.draw do
  get "notes(/:title)", to: 'notes#show', as: :note

  resource :network, only: [:show], controller: 'network'
  resource :calendar, only: [:show], controller: 'calendar'

  root to: 'notes#show'
end
