# RPC Message Serializer
# ----------------------
# Only loaded if transport requires messages to serialized before sending

#msgpack = require('msgpack-0.4')  (Note: I tried this but it made negligible difference, in some cases slower than JSON!)

exports.json =
	pack: (obj) ->
	  JSON.stringify(obj)
	unpack: (msg) ->
	  JSON.parse(msg.toString())
  
exports.msgpack =
  pack: (obj) ->
    msgpack.pack(obj)
  unpack: (msg) ->
    msgpack.unpack(msg)