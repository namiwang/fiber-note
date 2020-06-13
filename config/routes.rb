Rails.application.routes.draw do
  resources :notes, only: [:new, :edit]
end
