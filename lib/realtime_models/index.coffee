# Realtime Models
# ---------------
# Realtime models are highly experimental and certain to change! Hence they are disabled on the client side by default.

fs = require('fs')

exports.rest = require('./rest.coffee')

# Broadcast an update
exports.broadcast = (msg) ->
  $SS.publish.broadcast('rtm', msg)


# RTM call from Client
exports.call = (msg, cb) ->

  # Try to grab the model
  rtm = $SS.models[msg.rtm]

  if rtm?
  
    # Horrible temporary hack for Mongoose to turn any where fields beginning with 'regexp:' into true regular expression objects as these will not pass through the JSON.stringifier
    msg.params[0].keys().forEach (key) ->
      v = msg.params[0][key]
      if typeof(v) == 'string'
        query = v.substring(7)
        msg.params[0][key] = new RegExp(query, 'gi') if v.substring(0,7) == 'regexp:'
    
    # Assemble the params to be passed to the model
    params = msg.params
    params = [params] unless typeof(params) == 'object'
    params.push(cb)

    # Execute the action!
    rtm[msg.action].apply(rtm, params)
  else
    console.error msg.rtm + ' is NOT found'
  
