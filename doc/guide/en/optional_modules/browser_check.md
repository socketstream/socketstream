### Browser Check - dealing with incompatible browsers

_Module status: Disabled by default. Enable with `SS.config.browser_check.enabled = true`_

By default SocketStream will attempt to serve real time content to all browsers - either using native websockets (if available) or by falling back to XHR Polling or another Socket.IO fallback transport.

As fallback transports are not ideal (more overhead, initial connection latency) you may prefer to refuse clients which don't support websockets by enabling Strict Mode:

``` coffee-script
SS.config.browser_check.strict = true
```
    
Once set, only Chrome 4 and above, Safari 5 and above and Firefox 6 and above will be allowed to connect to your app. All others will be shown /app/views/incompatible.jade (or .html) if present. The name of this view can be customized with `SS.config.browser_check.view_name`.

Note: The serving of HTTP API requests occurs before the browser is checked for compatibility and is hence not affected by these settings.