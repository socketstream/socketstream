### Internal RPC Spec

_This is basic documentation for SocketStream core developers_

At present RPC calls between front and back end SocketStream servers are in JSON format for maximum flexibility as we experiment with new ideas. Once things settle down a little we will be able to test and benchmark alternative formats for even higher throughput.


#### The request

Requests are composed of the following params:
       
    **version**      Mandatory. Back end servers will silently drop messages unless they match the same RPC version number (allowing upgrades to be staggered)
    **responder**    Mandatory. Contains the name of the backend responder which will be invoked
    **origin**       Mandatory. Currently either 'socketio' or 'api'
    **id**           Optional. Used when sending a request which requires a response. The 'id' must be passed through to the response

And in addition for messages to /app/server methods:

    **method**       Optional. Tells the message handler which command to invoke
    **params**       Optional. Any arguments send to the method, as an array
    **session**      Optional. Sent only if the transport supports persistent sessions. Should be an object containing id, user_id, channel subscriptions and more
    **post**         Optional. Post data, if present, as submitted over the HTTP API

Hence a typical request originating from a front end server via Socket.IO looks like this:

    { 
      id: 1,
      session: {id: 'lBxsWeoQDPZjl6Ylb2P5XeSipfSkcw1N', user_id: 'joebloggs', attributes: []}
      origin: 'socketio',
      method: 'app.square',
      params: [5]
    }

Whereas a typical request originating from the HTTP API looks like this:

    { 
      id: 2,
      origin: 'api',
      post: 'something=nothing'
    }

#### The response

When successful:

    { 
      id: 1,
      result: 54
    }

Should you modify any session params:

    { 
      id: 1,
      result: 54
      session_updates: {user_id: 'fred'}
    }

When there is an error:

    { 
      id: 1,
      error: {code: 'MISSING_PARAMS', message: 'Some params are missing'}
    }


#### Why JSON?

Other serialization formats were tried but initial tests show none or little performance improvement using Msgpack and problems with recursive serialization of nested objects when using various BSON implementations. So for now JSON is a good choice - especially as it doesn't require any C libraries to be compiled.

SocketStream developers: Feel free to experiment and benchmark other message formats but bear in mind the need to recursively serialize nested objects.