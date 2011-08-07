# Message Responders
# ------------------

# Note: Additional custom responders can now be loaded into SS.internal.backend.responders via /lib/server modules or npm packages. 
# This will remain undocumented until there is a similar solution for the front end :)
EventEmitter = require('events').EventEmitter
SS.backend.responders = new EventEmitter

# Listen for internal system calls
require('./system.coffee')

# Listen for internal calls from websocket clients
require('./client.coffee')

# Listen for calls to /app/server actions
require('./server.coffee')

# Listen for calls to /app/models (only if Realtime Models are enabled)
require('./rtm.coffee') if SS.config.rtm.enabled

# Required when benchmarking
require('./benchmark.coffee')
