# Websocket ID subscriptions
# --------------------------
# Stores a list of which socket IDs are subscribed to which users or channels
# and delivers events accordingly

UniqueSet = require('../utils/unique_set').UniqueSet

module.exports = 
  user:     new UniqueSet
  channel:  new UniqueSet