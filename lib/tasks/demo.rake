namespace :demo do
  desc "for demo instance, deletes all notes and creates a welcome note"
  task reset: :environment do
    Block.delete_all
    Rake::Task['db:seed'].invoke
  end
end
