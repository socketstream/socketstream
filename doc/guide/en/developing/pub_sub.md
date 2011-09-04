### Pub/Sub - Broadcasting events and Private Channels

In addition to the `SS.publish.user()` method documented in Example 3 within the README, there are two additional publish commands which allow you to easily message users in bulk.


#### Broadcasting

To send a notification to every connected client (for example to let everyone know the system is going down for maintenance), use the broadcast method:

``` coffee-script
SS.publish.broadcast('flash', {type: 'notification', message: 'Notice: This service is going down in 10 minutes'})
```

Receive the event in the browser with:

``` coffee-script
SS.events.on 'flash', (msg) ->
  alert(msg.message)
```

#### Private Channels
    
Sometimes you'll want to send events to a sub-set of connected users. For example, if you have a chat app with multiple rooms. SocketStream supports Private Channels which let you do just that.

The syntax is similar to the command above with an extra initial argument specifying the channel name (or names as an array):

``` coffee-script
SS.publish.channel(['disney', 'kids'], 'newMessage', {from: 'mickymouse', message: 'Has anyone seen Tom?'})
```

Receive these events in the browser in the usual way. Note: If the event was sent to a channel, the channel name is passed to the second argument:

``` coffee-script
SS.events.on 'newMessage', (msg, channel_name) ->
  console.log "The following message was sent to the #{channel_name} channel:", msg
```
 
Clients can subscribe to an unlimited number of channels using the following commands (which must be run inside your /app/server code). E.g:

``` coffee-script
  @session.channel.subscribe('disney')        # note: multiple channel names can be passed as an array 
    
  @session.channel.unsubscribe('kids')        # note: multiple channel names can be passed as an array

  @session.channel.unsubscribeAll()           # unsubscribes you from every channel (useful if you've logged out)
    
  @session.channel.list()                     # shows which channels the client is currently subscribed to
```

**Notes**

1. Methods that 'do' things (e.g. `subscribe`) can take an optional callback - especially useful if you're writing high-speed integration tests.

2. If the channel name you specify does not exist it will be automatically created. Channel names can be any valid JavaScript object key. If the client gets disconnected and re-connects to another server instance they will automatically be re-subscribed to the same channels, providing they retain the same session ID. Be sure to catch for any errors when using these commands.

3. The SocketStream Pub/Sub system has been designed from the ground up with horizontal scalability and high-throughput in mind. The 'broadcast' and 'channel' commands will be automatically load-balanced across all SocketStream servers.

4. It is important to remember messages are never stored or logged. This means if a client/user is offline the message will be lost rather than queued. Hence, if you're implementing a real time chat app we recommend storing messages in a database (or messaging server) before publishing them.

