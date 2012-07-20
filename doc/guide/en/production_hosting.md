# Production Hosting

This section contains a few things you should know about before deploying your SocketStream app to production. It will be updated in the future as users discover new tips and tricks, especially around scaling and clustering.


### Packing Assets

SocketStream includes an integrated Asset Manager which generates one HTML, JS and CSS file for each client defined in `app.js`. All JS and CSS files (including libraries) are concatenated and then minified using [UglifyJS](https://github.com/mishoo/UglifyJS) and [CleanCSS](https://github.com/GoalSmashers/clean-css) respectively.

To use this feature, insert the following code into your `app.js` file:

```javascript
// in app.js
if (ss.env === 'production') ss.client.packAssets();
```

To begin packing assets, start your app in `production` mode with:

    $ SS_ENV=production node app.js


#### How does it work?

The `packAssets` command first checks to see if any packed asset files exist in `/client/static/assets`. This feature allows you to pack assets on your local development machine and include them in the deployment (recommended).

If existing asset files are found they will be used. If not, SocketStream will begin packing assets for each client you defined with `ss.client.define()`, assigning each client a unique timestamp / ID. Old files will automatically be deleted unless you call `ss.client.packAssets({keepOldFiles: true});`.

Note: To force the repacking of assets (i.e. if you've just made a change to the JS or CSS and want to see the result) launch your app with the `SS_PACK=1` prefix as so:

    $ SS_PACK=1 node app.js

As for the generated HTML file, this is loaded once into RAM when SocketStream starts. All requests for this file will be served from the cache for maximum performance.

Note: GZip support is coming soon in SocketStream 0.4.



### Using a CDN

We strongly recommend hosting your JS and CSS asset files on a CDN such as Amazon CloudFront. Not only will this greatly improve response times, but it means your SocketStream app servers can spend more time processing requests over the websocket and less time serving static files.

If you've viewed the source of a packed HTML file you'll notice it contains two links which look a bit like this:

```html
<link href="/assets/main/1342794202729.css" media="screen" rel="stylesheet" type="text/css">
<script src="/assets/main/1342794202729.js" type="text/javascript"></script>
```

These URLs are fine if you're hosting your assets locally, but to use a CDN requires adding a prefix. To do this, pass the following options to the `ss.client.packAssets()` command, as shown in the example code below (taken from www.socketstream.org):

```javascript
// in app.js
ss.client.packAssets({cdn: {
  css: function(file) { return "http://d3ah62tf336cdf.cloudfront.net" + file.path; },
  js:  function(file) { return "http://d3ah62tf336cdf.cloudfront.net" + file.path; }
}});
```

Once the CDN prefix is setup you may deploy your code as usual. CloudFront will automatically cache new asset files for you.


### Preparing your servers

Unless you're deploying to a hosting platform such as [Nodejitsu](http://nodejitsu.com) (which provides an optimal environment for Node.js apps), you'll need to ensure your servers are configured to handle a large number of simulations connections.

One of the most important settings to configure correctly is the maximum number of open file descriptors. This can be found by running `ulimit -n` on a Linux/UNIX machine. Bear in mind that each new websocket connection will use at least one file descriptor, so you'll need to ensure this is set to a very high number, or remove the limit altogether.

Note: On Amazon Linux (EC2) this is set to 1024 by default - much too low for a typical high traffic site.



### Catching Uncaught Exceptions

To prevent the server from terminating as a result of an uncaught exception in either your app or in SocketStream, we automatically catch uncaught errors and print them out to the console.

This built-in 'safety net' is automatically activated when you call `ss.client.packAssets()` as you typically would in production.

Alternatively you can write your own error handling code which may look something like this:

```javascripts
// in app.js
process.on('uncaughtException', function(e){
  emailServerAdmins(e);
  logToDatabase(e);
});
```

SocketStream will check for any custom error handling code and use it if present.