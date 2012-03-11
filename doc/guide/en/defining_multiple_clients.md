# Defining Multiple Single-Page Clients

SocketStream is exclusively a single-page framework; however we make it easy to define and send multiple single-page clients to different devices (e.g. desktop browsers and iPhones), or serve them on different URLs (useful for providing an /admin interface).

New clients are defined with the `ss.client.define()` function in your `app.js` file. You may define as many as you like, just be sure to give each one a unique name (passed to the first argument).


### Default settings

A single-page client consist of one HTML view and multiple CSS, client-side code and template files.

When you create a new SocketStream project we define a `main` client for you with the following options:

```javascript
// in app.js
ss.client.define('main', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'app'],
  tmpl: '*'
});
```

For each type of asset you may provide one or more file names or directory names. When passing directory names, the contents of the directory (including any sub-directories) will be served alphanumerically.

Let's look more closely at each type of asset:

##### view
Views are pages of HTML which provide the main layout and structure for your app. They are stored in `/client/views`. If you're using plain HTML instead of Jade you'll want to name this `app.html`. Due to the nature of a single-page application, you may only specify one view for each client you define.

##### css
CSS files live in `/client/css`. This option allows you to specify as many files or directories as you wish. As order is important why serving CSS, you'll need to make sure any CSS libraries (e.g. `reset.css`) are sent before your application stylesheets.

Note: If you're using Stylus, you'll only need to specify the first `.styl` file here as any additional files can be imported using the `@import` command. If you're using plain CSS, you'll need to list each `.css` file individually or pass the name of a directory instead.

##### code
Client-side code lives in `/client/code`. This option allows you to specify as many files or directories as you wish to be sent to the client upon initial connection.

Important: Modules are always mounted to the root (/) namespace, even if you specify nested directories.  Hence if you specify `code: ['iphone/new_release']`, and have a module in here called `calendar.js` you will require this module as `require('/calendar')` in your app, not `require('/iphone/new_release/calendar')`. 

Not all code has to be sent upon initial connection - you may prefer to [load some modules asynchronously](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/loading_assets_on_demand.md) into your application on demand.

##### tmpl
Client-side Templates live in `/client/templates`. This option allows you to specify multiple files or directories of templates to be sent to the client upon initial connection. Note the `*` means send everything.


### Defining a new client

For this example let's imagine we want to define a new single-page client to be sent to an iPhone:

```javascript
ss.client.define('iphone', {
  view: 'iphone.jade',
  css:  ['libs', 'iphone.styl'],
  code: ['libs', 'app'],
  tmpl: 'iphone'
});
```

Here we're not only specifying a different view (`/client/views/iphone.jade`) but we're also choosing to send different CSS and client-side templates, though in this example we've not changed the client-side code we're sending.


### Serving different clients

Once you've defined a single-page client you can choose to serve it on a particular URL:

```javascript
ss.http.router.on('/', function(req, res) {
  res.serveClient('main');
});

ss.http.router.on('/iphone', function(req, res) {
  res.serveClient('iphone');
});
```

or depending upon the browser's UserAgent:

```javascript
ss.http.router.on('/', function(req, res) {
  if (req.headers['user-agent'].match(/iPhone/))
    res.serveClient('iphone');
  else
    res.serveClient('main');
});
```

### Sharing common code

Typically you'll want to divide all your assets into three sections: Those to be served to desktop clients, those for to be served to mobile clients, and those to be shared by both.

Hence a typical desktop/iPhone config may look something like this:

```javascript
ss.client.define('desktop', {
  view: 'desktop.jade',
  css:  ['common/libs', 'desktop/libs', 'desktop.styl'],
  code: ['common/libs', 'desktop/libs', 'common/app', 'desktop/app'],
  tmpl: ['common', 'desktop']
});

ss.client.define('iphone', {
  view: 'iphone.jade',
  css:  ['common/libs', 'iphone/libs', 'iphone.styl'],
  code: ['common/libs', 'iphone/libs', 'common/app', 'iphone/app'],
  tmpl: ['common', 'iphone']
});
```

As you can see, SocketStream gives you the flexibility and power to mix and match client-side assets for any possible combination of devices or pages without having to duplicate code.
