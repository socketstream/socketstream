# Parse commands from 'socketstream' binary
# There will be other commands in the future

exports.process = (args) ->
  switch args[0]
    when 'new', 'n'
      require('./generate').generate(args[1])
    else
      console.log('Type "socketstream new <projectname>" to create a new application')