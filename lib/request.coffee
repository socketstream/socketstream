# Incoming Data Request Handler
# -----------------------------
# Used to handle Socket.IO and API requests
# Remember, the process action needs to be written for speed

url_lib = require('url')
utils = require('./utils')

prefix = '/app/server'

exports.process = (action_array, params, session, user, cb) ->
  throw ['invalid_action_format', "Invalid action format"] unless typeof(action_array) == 'object'
  throw ['invalid_action_length', "Invalid action length"] unless action_array.length >= 2

  actions = action_array.slice(0)  # Create a copy before we mangle it
  action = actions.pop()

  obj = utils.getFromTree($SS.server, actions)

  # Check module exists before we attempt to call a function on it
  throw ['unable_to_find_module',"Unable to find the #{prefix}/#{actions.join('/')} module. Does the file exist?"] unless obj

  # Check to see method exists
  method = obj[action]
  throw ['action_missing',"Unable to find the '#{action}' action in #{prefix}/#{actions.join('/')}. Action names are case sensitive"] unless method 
  
  # Inject 'helper functions'
  obj.session = session
  obj.user = user

  # Build up args to pass to server action
  args = []
  args.push(params) if params
  args.push(cb)
  
  # Check we have have the correct number of params
  throw ['callback_missing',    "The #{action} action is missing the callback argument"]        if method.length == 0
  throw ['params_missing',      "The #{action} action expects params but none were sent"]       if method.length > args.length
  throw ['params_not_required', "The #{action} action was sent params but can't receive them"]  if method.length < args.length

  # Attempt the request
  try
    method.apply(obj, args)
  catch e
    throw ['application_error', e.stack]

