### Logging and Debugging

Client and server-side logging is switched on by default in __development__ and __staging__ and off in __production__. It can be controlled manually via `SS.config.client.log.level` and `SS.config.log.level` respectively. Four levels of logging are available ranging from none (0) to highly verbose (4). The default level is 3.


#### Using the Node.js debugger

You may load the debugger by prefixing `debug` before any `socketstream` command. E.g.

    socketstream debug start

Hint: It works best in single process mode. Even if you have ZeroMQ installed, you can force SocketStream to start in single process mode with 

    socketstream debug single

You may also want to install the excellent Node Inspector: https://github.com/dannycoates/node-inspector


#### Exception handling

Thanks to Server-side Events, you can easily listen to exceptions caught in your application code:

``` coffee-script
SS.events.on 'application:exception', (error) ->
  console.log "Application exception caught: #{error.message}"
  # send an email to the developers
```