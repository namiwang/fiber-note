Rails.application.routes.draw do
  resource :session, only: [:new, :create], controller: 'session'

  get "notes(/:title)", to: 'notes#show', as: :note

  resource :network, only: [:show], controller: 'network'
  resource :calendar, only: [:show], controller: 'calendar'

  root to: 'notes#show'
end
