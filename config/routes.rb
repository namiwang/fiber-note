Rails.application.routes.draw do
  resources :notes, only: [:index, :new, :edit, :update]

  root to: 'notes#index'
end
