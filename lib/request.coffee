# Incoming Data Request Handler
# -----------------------------
# Used to handle Socket.IO and API requests
# Remember, the process action needs to be written for speed

url_lib = require('url')
utils = require('./utils')

prefix = '/app/server'

exports.process = (action_array, params, session, cb) ->
  throw new Error("Invalid action format") unless typeof(action_array) == 'object'
  throw new Error("Invalid action length") unless action_array.length >= 2

  actions = action_array.slice(0)  # Create a copy before we mangle it
  action = actions.pop()

  obj = utils.getFromTree(SS.server, actions)
  
  # Check module exists before we attempt to call a function on it
  throw new Error("Unable to find the #{prefix}/#{actions.join('/')} module. Does the file exist?") unless obj

  # Check to see method exists
  method = obj[action]
  throw new Error("Unable to call the '#{action}' action as this is a reserved word. Please choose an alternative action name") if action in ['session','user']
  throw new Error("Unable to find the '#{action}' action in #{prefix}/#{actions.join('/')}. Action names are case sensitive") unless method
  
  # Inject 'helper functions'
  obj.session = session
  obj.user = session.user

  # Build up args to pass to server action
  args = []
  args.push(params) if params
  args.push(cb)
  
  # Check we have have the correct number of params
  throw new Error("The #{action} action is missing the callback argument")        if method.length == 0
  throw new Error("The #{action} action expects params but none were sent")       if method.length > args.length
  throw new Error("The #{action} action was sent params but can't receive them")  if method.length < args.length

  # Attempt the request
  try
    method.apply(obj, args)
  catch e
    throw new Error(e.stack)
