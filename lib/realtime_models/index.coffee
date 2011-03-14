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
  
    cb = (err, data) ->
      reply = {}
      reply.data = data
      reply.cb_id = msg.cb_id
      reply.type = 'rtm'
      client.send(JSON.stringify(reply))
  
    rtm = $SS.models[msg.rtm]
    
    params = msg.params
    params = [params] unless typeof(params) == 'object'
    params.push(cb)

    rtm[msg.action].apply(rtm, params)
  else
    console.log (msg.rtm + ' is NOT found')
  
