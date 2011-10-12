### Virtual Hosting

[Bouncy](https://github.com/substack/bouncy) is a great new `npm` package that transparently sends HTTP, HTTPS and WebSocket traffic to another TCP port according to the domain name visited; thus allowing you to run multiple SocketStream apps on one server.

#### Walkthrough

Let's say you have two SocketStream applications: `fantasticapp.com` running on port 3000, and `awesomeapp.io` running on port 3001. Let's assume both applications are running right now, and that there are no processes bound to port 80 on the server.

The first step is to install bouncy:

    npm install bouncy

Next, create a simple CoffeeScript file (called `routes.coffee`) that will run continuously:

``` coffee-script
bouncy = require 'bouncy'

bouncy (req, bounce) ->
  switch req.headers.host
    when 'fantasticapp.com' then bounce 3000
    when 'awesomeapp.io' then bounce 3001
    else
      console.log "Sorry, #{req.headers.host} is not in the list of urls served"
.listen 80
```

Run this script with the following command:

    sudo coffee routes.coffee

And there you go! Visit one of the domains you've configured and you'll instantly be directed to the correct SocketStream app.