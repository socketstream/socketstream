# Request Handler for /app/server functions
# -----------------------------------------
# Used to handle incoming requests from the front end. These can either be from Socket.IO or the HTTP API
# Remember, the process action needs to be written with speed in mind as everything flows through it!

url_lib = require('url')
utils = require('../../utils')
Session = require('../session.coffee').Session

prefix = '/app/server'

# Listen for calls to /app/server actions
SS.backend.responders.on 'server', (obj, cb) ->
  try
    process obj, (result, options) ->
      SS.log.outgoing.server(obj)
      cb {id: obj.id, result: result, options: options}
  catch e
    SS.log.error.exception('Error: ' + e.message) if e.message
    cb {id: obj.id, error: e}


# Private

process = (obj, cb) ->

  action_array = obj.method.split('.')

  throw error('INVALID_ACTION_FORMAT', "Invalid action format") unless typeof(action_array) == 'object'
  throw error('INVALID_ACTION_LENGTH', "Invalid action length") unless action_array.length >= 2

  # Create a copy before we mangle it
  actions = action_array.slice(0)
  action = actions.pop()

  # Make sure action name isn't reserved
  throw error('RESERVED_WORD', "Unable to call the '#{action}' action as this is a reserved word. Please choose an alternative action name") if action in ['getSession']

  # Load the module from the SS.server tree (which is only loaded once)
  server_module = utils.getFromTree(SS.server, actions)
  
  # Check module exists before we attempt to call a function on it
  throw error('MODULE_NOT_FOUND', "Unable to find the #{prefix}/#{actions.join('/')} module. Does the file exist?") unless server_module
  
  # Check to see if the action exists within the file
  method = server_module[action]
  throw error('ACTION_NOT_FOUND', "Unable to find the '#{action}' action in #{prefix}/#{actions.join('/')}. Action names are case sensitive") unless method
  
  # Inject 'helper functions'
  server_module.getSession = (scb) ->
    (new Session(obj.session_id))._findOrCreate scb

  # Build up args to pass to server action
  args = []
  args.push(obj.params) if obj.params
  args.push(cb)
  
  # Check we have have the correct number of params
  throw error('MISSING_CALLBACK',    "The #{action} action is missing the callback argument")        if method.length == 0
  throw error('MISSING_PARAMS',      "The #{action} action expects params but none were sent")       if method.length > args.length
  throw error('PARAMS_NOT_REQUIRED', "The #{action} action was sent params but can't receive them")  if method.length < args.length

  # If the server_module requires authentication do it here
  if SS.internal.authenticate[actions.join('.')]
    server_module.getSession (session) ->
      if session.user.loggedIn()
        execute(method, server_module, args)
      else
        throw error('UNAUTHORIZED', "This session has not been authenticated")
  else
    execute(method, server_module, args)


# Attempt the request
execute = (method, server_module, args) ->
  try
    method.apply(server_module, args)
  catch e
    throw error('APPLICATION_ERROR', e.stack)

error = (code, message) ->
  {code: code, message: message}


