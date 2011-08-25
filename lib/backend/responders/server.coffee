# Request Handler for /app/server functions
# -----------------------------------------
# Used to handle incoming requests from the front end. Requests can either originate from Socket.IO or the HTTP API
# Remember, the process action needs to be written with speed in mind as everything flows through it!

url_lib = require('url')
utils = require('../../utils')
Session = require('../session.coffee').Session

prefix = '/app/server'

# Allow 'reserved variables' to be renamed (e.g. to match your local tongue)
var_session = SS.config.reserved_vars.session
var_request = SS.config.reserved_vars.request
var_user =    SS.config.reserved_vars.user

# Make a list of variables you cannot use as action names (and warn below if you try)
reserved_variables = ['getSession', var_session, var_request, var_user]

# Listen for calls to /app/server actions
SS.backend.responders.on 'server', (obj, cb) ->
  try
    obj.session_obj = new Session(obj.session)
    process obj, (result) ->
      SS.log.outgoing.server(obj)
      response = {id: obj.id, result: result}
      # Send the new session object back only if it has been updated during this request
      response.session_updates = obj.session_obj._updates(obj.session) if obj.session
      cb response
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
  throw error('RESERVED_WORD', "Unable to call the '#{action}' action as this is a special reserved word. Please rename this action or specify different reserved variables names with SS.config.reserved_vars") if action in reserved_variables

  # Load the module from the SS.server tree (which is only loaded once)
  server_module = utils.getFromTree(SS.server, actions)
  
  # Check module exists before we attempt to call a function on it
  throw error('MODULE_NOT_FOUND', "Unable to find the #{prefix}/#{actions.join('/')} module. Does the file exist?") unless server_module

  # Check to see if the action exists within the file
  method = server_module[action]
  throw error('ACTION_NOT_FOUND', "Unable to find the '#{action}' action in #{prefix}/#{actions.join('/')}. Action names are case sensitive") unless method

  # Build up args to pass to server action
  args = obj.params || []
  args.push(cb)

  # Check we have have the correct number of params
  throw error('MISSING_CALLBACK',   "The #{action} action is unable to take a callback as the last argument") if method.length == 0
  throw error('MISSING_ARGS',       "The #{action} action expects #{(method.length - 1).pluralize('argument')} (plus a callback) but #{if (a = args.length - 1) > 0 then 'only ' + a else 'none'} #{if args.length == 2 then 'was' else 'were'} sent") if method.length > args.length
  throw error('TOO_MANY_ARGS',      "The #{action} action was sent #{(args.length - 1).pluralize('argument')} (plus a callback) but can only receive #{method.length - 1}") if method.length < args.length

  # Create the @request object
  server_module[var_request] = request = {id: obj.id}
  request.origin = obj.origin     if obj.origin
  request.post = post(obj.post)   if obj.post
 
  # Create @session object if we have a session_id
  server_module[var_session] = obj.session_obj
    
  # Keep in for compatibility until 0.3
  server_module.getSession = (scb) ->
    console.log 'Warning: @getSession will be removed in 0.3. Please use the @session variable'
    scb server_module[var_session]
  
  # Make sure we have a valid user_id
  throw error('UNAUTHORIZED', "This session has not been authenticated") if SS.internal.authenticate[actions.join('.')] and !server_module[var_session].user.loggedIn()

  # Execute action  
  try
    method.apply(server_module, args)
  catch e
    SS.events.emit 'application:exception', e
    throw error('APPLICATION_ERROR', e.stack)


# Return an object containing post data
# Will be expanded in the future to allow @request.post.params and @request.post.file.saveTo('/tmp/myfile.jpg') etc
post = (raw_data) ->
  {raw: raw_data}

error = (code, message) ->
  {code: code, message: message}


