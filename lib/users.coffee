# Users
# -----
# Manages users online within the cluster and connected to this particular instance
# TODO: Handle errors by processing callbacks

key = $SS.config.redis.key_prefix

# Users connected to this server instance
exports.connected = []


# Users Online

exports.online =

  # Get a (potentially huge) list of all User IDs online
  all: (cb = console.log) ->
    R.smembers "#{key}:online:now", (err, data) -> cb(data)

  # Add a User ID to the list of Users Online
  add: (uid) ->
    R.sadd "#{key}:online:now", uid
    @confirm(uid)
  
  # Confirm a User ID is still online
  confirm: (uid) ->
    R.sadd "#{key}:online:at:#{minuteCode()}", uid
  
  # Remove a User ID from the list of Users Online
  remove: (uid) ->
    R.srem "#{key}:online:now", uid
    
  # Purge any users which haven't 'confirmed' themselves online within $SS.config.users.online.mins (default = 2)
  # Each minute gets it's own key in Redis. Every $SS.config.users.online.purge_interval (default 60 seconds) we run $SS.users.online.purge()
  # to union all the users who confirmed within the last $SS.config.users.online.mins (default 2) and remove everyone else.
  # As Redis evolves we should be able to find more efficient ways to do this.
  purge: ->
    # Store the User IDs online within the last X minutes in a temporary key
    keys = [0..($SS.config.users.online.mins - 1)].map (mins_ago) -> "#{key}:online:at:#{minuteCode(mins_ago)}"
    args = ["#{key}:online:recent"].concat(keys)
    R.sunionstore.apply(R, args)
    
    # Compares the people online now to those in the last X mins, effectively removing anyone who went offline X mins ago
    R.sinterstore "#{key}:online:now", "#{key}:online:now", "#{key}:online:recent"


# Private Helpers

minuteCode = (mins_ago = 0) ->
  t = Math.ceil(Number(new Date() / 1000))
  t -= (t % 60)
  t -= (mins_ago * 60)
