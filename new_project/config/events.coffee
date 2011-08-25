# Server-side Events
# ------------------
# Uncomment these events to run your own custom code when events are fired

# SS.events.on 'client:init', (session) ->
#   console.log "The client with Session ID #{session.id} has initialized (loaded or reloaded the page)"

# SS.events.on 'client:disconnect', (session) ->
#   console.log "The client with Session ID #{session.id} and User ID #{session.user_id} has disconnected"

# SS.events.on 'client:heartbeat', (session) ->
#   console.log "The client with Session ID #{session.id} (User ID #{session.user_id}) is still alive!"

# SS.events.on 'channel:subscribe', (session, channel) ->
#   console.log "The client with Session ID #{session.id} has subscribed to #{channel}"

# SS.events.on 'channel:unsubscribe', (session, channel) ->
#   console.log "The client with Session ID #{session.id} has unsubscribed from #{channel}"

# SS.events.on 'application:exception', (error) ->
#   console.log "Application exception caught: #{error.message}"