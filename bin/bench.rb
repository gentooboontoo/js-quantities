#!/usr/bin/env ruby

Dir.chdir(File.join(File.dirname(__FILE__), '..'))

port = ENV['PORT'] || '3000'
commit = ENV['COMMIT'] || 'HEAD'

pid = fork do
  exec "adsf -p #{port}"
end

`git show #{commit}:src/quantities.js > src/.committed-quantities.js`

puts "Bench server launched: please open http://0.0.0.0:#{port}/bench"

begin
  Process.wait(pid)
rescue Interrupt => e
  puts "Killing web server..."
  Process.kill(9, pid)
end

File.unlink 'src/.committed-quantities.js'
