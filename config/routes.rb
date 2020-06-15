Rails.application.routes.draw do
  resources :notes, only: [:new, :edit, :update]
end
