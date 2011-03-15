# Realtime Models
# ---------------
# NOTE: All highly experimental and certain to change!

fs = require('fs')

exports.rest = require('./rest.coffee')

# Broadcast an update
exports.broadcast = (msg) ->
  $SS.publish.broadcast('rtm', msg)


# Call from Public
exports.call = (msg, client) ->
  $SS.log.incoming.rtm(msg, client)
          
  if $SS.models[msg.rtm]?
  
    # Define the callback which sends data back over the websocket
    cb = (err, data) ->
      reply = {}
      reply.data = data
      reply.cb_id = msg.cb_id
      reply.type = 'rtm'
      client.send(JSON.stringify(reply))
  
    # Get hold of the model
    rtm = $SS.models[msg.rtm]

    # Hack to turn any where fields beginning with 'regexp:' into true regular expression objects as these will not pass through the JSON.stringifier
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
    console.log (msg.rtm + ' is NOT found')
  
