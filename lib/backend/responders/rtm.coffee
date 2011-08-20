# Request Handler for Realtime Models
# -----------------------------------
# Realtime models are highly experimental and certain to change! Hence they are undocumented and disabled on the client side by default

fs = require('fs')

# RTM call from Client
process = (msg, cb) ->

  # Try to grab the model
  rtm = SS.models[msg.rtm]

  if rtm?
    # Assemble the params to be passed to the model
    params = msg.params
    params = convertStringsToRegExps(params) # nasty temporary hack for Mongoose - see below
    params = [params] unless typeof(params) == 'object'
    params.push(cb)

    # Execute the action!
    rtm[msg.action].apply(rtm, params)
  else
    console.error msg.rtm + ' is NOT found'
  
# Recursively (thanks Stephen) converts any string containing 'regexp:' into a real regular expression object that can be fed to Mongoose
convertStringsToRegExps = (params) ->
  params.keys().forEach (key) ->
    v = params[key]
    if typeof(v) == 'string'
      query = v.substring(7)
      params[key] = new RegExp(query, 'gi') if v.substring(0,7) == 'regexp:'
    else if typeof(v) == 'object'
      params[key] = convertStringsToRegExps(v)
  params


# List for calls to /app/models
SS.backend.responders.on 'rtm', (obj, cb) ->
  process obj, (err, data) ->
    SS.log.outgoing.rtm(obj)
    cb {id: obj.id, result: data}
