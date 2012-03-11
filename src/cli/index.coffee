# Parse commands from 'socketstream' binary
# There will be other commands in the future

exports.process = (program) ->
  switch program.args[0]
    
    # Create a new project
    when 'new', 'n'
      require('./generate').generate(program)
    
    else
      console.log('Type "socketstream new <projectname>" to create a new application')