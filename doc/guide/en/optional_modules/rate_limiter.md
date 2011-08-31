### Rate Limiter

_Module status: Disabled by default. Enable with `SS.config.rate_limiter.enabled = true`_

SocketStream can provide basic protection against DDOS attacks by identifying clients attempting to make over 15 requests per second over the websocket connection (configurable with SS.config.rate_limiter.websockets.rps).

When this occurs you'll be notified of the offending client in the console and the client will be disconnected.

For now this feature is very basic but we intend to develop it further in the future.