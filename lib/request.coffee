# Incoming Data Request Handler
# Used to handle Socket.IO and API requests
# Remember, the process method needs to be written for speed

util = require('util')
url_lib = require('url')

exports.process = (action_array, params, session, user, cb) ->
  actions = action_array.slice(0)  # Create a copy before we mangle it
  method = actions.pop()

  if method.charAt(0) == '_'
    util.log "Error: Unable to access private method #{method}"
  else      
    obj = loadKlass(actions)

    # Inject 'helper functions'
    obj.session = session
    obj.user = user

    # Build up args to pass to server method
    args = []
    args.push(params) if params
    args.push(cb)

    try
      obj[method].apply(obj, args)
    catch e
      throw e if $SS.config.throw_errors
      console.error(e)

loadKlass = (actions) ->
  path = "#{$SS.root}/app/server/#{actions.join('/')}"
  klass_name = actions.pop().capitalized()
  try
    klass = require(path)[klass_name]
    new klass
  catch e
    util.log 'Error: Unable to find class ' + klass_name + ' or error in file'
    throw e if $SS.config.throw_errors
    console.error(e)


