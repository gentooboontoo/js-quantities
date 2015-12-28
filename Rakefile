require "rubygems"
require "bundler/setup"

require 'jshintrb/jshinttask'

Jshintrb::JshintTask.new :jshint do |t|
  t.pattern = 'lib/**/*.js'
end

desc "Benchmark checked-out version against committed one, defaults PORT=3000, COMMIT=HEAD"
task :bench do
  `bin/bench.rb`
end
