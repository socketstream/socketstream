### Environments and Configuration

Like other frameworks, SocketStream supports running your code in multiple environments.

SocketStream runs in __development__ mode by default, outputting all incoming and outgoing requests to the terminal, displaying all server-side exceptions in the browser console, and compiling all client assets on the fly in order to aid debugging.

Two other 'preset' environments are available: __staging__ and __production__. Both will load SocketStream with sensible defaults for their intended use.

Preset variables can be overwritten and augmented by two optional files if required: an application-wide config file placed in /config/app.coffee, and an environment-specific file placed in /config/environments/<SS_ENV>.coffee (e.g. /config/environments/development.coffee) which will override any values in app.coffee.

Use the SS_ENV environment variable to start SocketStream in a different environment. E.g:

    SS_ENV=staging socketstream start
    
An unlimited number of new environments may also be added. You can easily tell which environment you're running in by typing `SS.env` in the server or client console.

Our forthcoming website will detail the full list of configurable params, but for now these can be viewed (and hence overridden in the config file), by typing `SS.config` in the SocketStream console.


#### How configuration files work

Throughout this README you'll see repeated references to config variables which look something like this:

    SS.config.limiter.enabled = true

In this case, you could change the value of the variable by adding the following to your config file:

``` coffee-script
exports.config =
  limiter: 
    enabled: true
```

#### Configuring Socket.IO
 
You may wish to configure Socket.IO 0.8 directly using the optional configure() function within /app/config.coffee
 
For example:
 
``` coffee-script
  socketio:
    configure: (io) ->
      io.set 'log level', 5
      io.set 'transports', ['websocket', 'flashsocket', 'xhr-polling']