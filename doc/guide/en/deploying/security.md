### Security

So how secure is SocketStream? Well, to be honest - we just don't know. The entire stack, from Node.js right up to the SocketStream client is brand new and no part of it is claiming to be production-ready just yet. So for now we recommend using SocketStream internally, behind a firewall.

Of course, if you're feeling adventurous, you're more than welcome to experiment with hosting public SocketStream websites. We're going to be doing this ourselves with www.socketstream.org. Just make sure there is no sensitive data on the server and you can easily restore everything should it become compromised.

If you are especially gifted at spotting vulnerabilities, or come across a potential security hole while looking through the source code, please let us know. We'd really appreciate it. It will bring us closer to the day when we're happy to recommend SocketStream for public websites.


#### XSS Attacks

A quick reminder: SocketStream is just as vulnerable to XSS attacks as other web frameworks. We advise filtering-out any malicious user generated content (UGC) both at input stage (in your /app/server code), as well as in the client before outputting UGC onto the screen. We will include 'helpers' for this in the future.

It is all too easy to append a line of JavaScript code to the end of a user-submitted link which wraps calls to 'SS.server' in a while loop. SocketStream includes a basic Rate Limiter to protect against this. Take a look at /doc/guide/en/optional_modules/rate_limiter.md
