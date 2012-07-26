# Pub/Sub Events

SocketStream includes an powerful pub/sub system allowing you to easily send messages to connected browsers over the websocket.


### 1. Sending to Everyone

To send an event to every connected client (for example to let them know the server's going down for maintenance), use the `ss.publish.all` method:

``` javascript
// in a /server/rpc file
ss.publish.all('flash', 'Notice: This service is going down in 10 minutes');
```

Receive the event in the browser with:

``` javascript
// in a /client/code file
ss.event.on('flash', function(message){
  alert(message);
});
```

Note: The first argument specifies the event name. All subsequent arguments will be passed through to the event handler.



### 2. Sending to Private Channels
    
Sometimes you'll want to send events to a subset of connected clients. For example, you may have a chat app with multiple rooms.

Each client session can be subscribed to an unlimited number of private channels using the following commands:

``` javascript
// in a /server/rpc file after calling req.use('session') middleware

req.session.channel.subscribe('disney')   // note: multiple channel names can be passed as an array 
    
req.session.channel.unsubscribe('kids')   // note: multiple channel names can be passed as an array

req.session.channel.reset()               // unsubscribes the session from every channel
    
req.session.channel.list()                // shows which channels the session is currently subscribed to
```

Sending a message to a private channel is similar to broadcasting to all; however, note the first argument now specifies the channel name (or channels if you pass an array):

``` javascript
// in a /server/rpc file
ss.publish.channel('disney', 'chatMessage', {from: 'jerry', message: 'Has anyone seen Tom?'});
```

Receive these events in the browser in the usual way. Note: If the event was sent to a channel, the channel name is passed as the final argument to the event handler:

``` javascript
// in a /client/code file
ss.event.on('chatMessage', function(msg, channelName){
  console.log('The following message was sent to the ' + channelName + ' channel:', msg);
});
```



### 3. Sending to Users

Once a user has been [authenticated](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/authentication.md) (which basically means their session now includes a value for `req.session.userId`), you can message the user directly by passing the `userId` (or an array of IDs) to the first argument of `ss.publish.user` as so:

``` javascript
// in a /server/rpc file
ss.publish.user('fred', 'specialOffer', 'Here is a special offer just for you!');
```

Important: When a user signs out of your app, you should call `req.session.setUserId(null, cb)` to prevent the browser from receiving future events addressed to that `userId`. Note: This command only affects the current session. If the user is logged in via other devices/sessions these will be unaffected.



### 4. Sending to Individual Clients (browser tabs)

If a user opens multiple tabs in the browser, each will share the same `req.session.id` and private channel subscriptions (as channels are attached to sessions).

Normally this is the desired behavior, but in rare cases you'll want to message a particular client (i.e. a individual browser tab):

``` javascript
// in a /server/rpc file
ss.publish.socketId('254987654324567', 'justForMe', 'Just for one tab');
```
You can find the socketId by calling `req.socketId` in your server-side code. Note, this attribute may not always be present (e.g. if you invoke the RPC method via `ss-console`), so plan accordingly.

**Warning!**  `req.socketId` will change every time you refresh the page, so in almost all cases it is **much** better to assign clients to Private Channels (which persist between browser reloads) and use these wherever possible. Only send an event to a specific socketId if there is no other way to achieve your goal.



### Publishing Events via app.js

Sometimes you'll want to publish events from outside your `/server/rpc` files, such as your `app.js` file. The entire `ss` API available to actions in `/server/rpc` is also available in `app.js` via the `ss.api` object. Hence to publish an event to `all` you would call:

``` javascript
// in /app.js
ss.api.publish.all()
```


### Event Transports

By default SocketStream sends all published events over an internal event emitter. This works fine during development and under moderate load, however; once your app outgrows a single process, you'll need to switch to an external event transport to allow you to run multiple SocketStream processes/servers at once.

Event transports are implemented in a modular way, so it's possible to write a simple driver to support any Message Queue.

To use the in-built Redis transport (recommended), add the following line to your `app.js` file:

``` javascript
// in app.js
ss.publish.transport.use('redis');  // any config can be passed to the second argument
```

Using an external event transport has an important added benefit: Now you can easily push events to connected browser from external (non Node.js) systems. Simply connect the external system (e.g. an Erlang service) to the same instance of Redis and publish messages using the same JSON message format.



**Notes**

1. If the channel name you specify does not exist it will be automatically created. Channel names can be any valid JavaScript object key. If the client gets disconnected and re-connects to another server instance they will automatically be re-subscribed to the same channels, providing they retain the same `sessionId`. Be sure to catch for any errors when using these commands.

2. The SocketStream Pub/Sub system has been designed from the ground up with horizontal scalability and high-throughput in mind. The `all` and `channel` commands will be automatically load-balanced across all SocketStream servers when an external event transport is used.

3. It is important to remember messages are never stored or logged. This means if a client/user is offline the message will be lost rather than queued. Hence, if you're implementing a real time chat app we recommend storing messages in a database (or messaging server) before publishing them.
