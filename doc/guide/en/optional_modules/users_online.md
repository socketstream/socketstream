### Tracking Users Online

_Module status: Enabled by default. Disable with `SS.config.users_online.enable = false`_

Once users are able to authenticate and log in, you'll probably want to keep track of who's online - especially if you're creating a real-time chat or social app. We've built this feature into SocketStream as an optional module.

When a user successfully authenticates (see section above) we store their User ID within Redis. You may obtain an array of User IDs online right now by calling this method in your server-side code:

``` coffee-script
SS.users.online.now (data) -> console.log(data)
```

If a user logs out, they will immediately be removed from this list. But what happens if a user simply closes down their browser or they lose their connection?

When this feature is enabled the SocketStream client sends an ultra-lightweight 'heartbeat' signal to the server every 30 seconds confirming the user is still online. On the server side, a process runs every minute to ensure users who have failed to check in within the last minute are 'purged' from the list of users online.


#### Config Options

All timings can be configured using `SS.config.client.heartbeat_interval` and the various params within `SS.config.users_online`.
