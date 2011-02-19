# Command Line Interface parser

util = require('util')

SS = require('./socketstream.js')

exports.process = (args) ->

  # If no arguments provided default to help page
  if typeof(args) == 'string'
    command       = 'help'
  else
    command       = args[1].toString().toLowerCase()
    params        = args.slice(2)

  # Process command
  switch command
    when 'start', 's'
      util.log('Starting SocketStream...')
      SS.init().start()
    when 'new', 'n'
      gen = require('./cli/app_generator.coffee')
      new gen.AppGenerator(params[0])
    when 'console', 'c'
      console.log('\nWelcome to the SocketStream Interactive Console. CONTROL+C to quit.\n')
      SS.init()
      repl = require('repl')
      repl.start('SocketStream > ')
    when 'version', 'v'
      console.log('SocketStream version ' + $SS.version.join('.'))
    when 'help', 'h'
      console.log '''
      SocketStream Command Line Help
      
        start (s)     Start server
        console (c)   Interactive console
        version (v)   Print version

      '''
    else
      console.log("Sorry, I do not know how to #{command}. Type \"socketstream help\" to see a list of commands.")
