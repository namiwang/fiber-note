Rails.application.routes.draw do
  resources :notes, only: [:new, :edit] do
    resource :nav, only: [:show]
  end

  resource :network, only: [:show], controller: 'network'

  root to: 'notes#new'
end
