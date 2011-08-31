### Project Directory Overview

The following directories are created whenever you run `socketstream new`:

#### /app/client
* All files within /app/client will be sent to the client
* Any CoffeeScript files will automatically be converted to JavaScript
* If you have a JavaScript library you wish to use (e.g. jQuery UI), put this in /lib/client instead
* The `SS.client.app.init()` function will be automatically called once the websocket connection is established
* Hence the /app/client/app.coffee (or app.js) file must always be present
* Nesting client files within multiple folders is supported. See section on Namespacing

#### /app/server
* All files in this directory can expose functions which can be called from the Client (see Server-side Code section)
* For example, to call app.init from the client and pass 25 as params, call `SS.server.app.init(25)` in the client
* All methods can be automatically accessed via the optional HTTP API (e.g. /api/app/square.json?5)
* All server methods are pre-loaded and accessible via `SS.server` in the console or from other server-side files
* The last argument must always be the callback (cb)
* All publicly available methods should be listed under 'exports.actions'. Private methods must be placed outside this scope and begin 'methodname = (params) ->'
* Server files can be nested. E.g. `SS.server.users.online.yesterday()` would call the 'yesterday' method in /app/server/users/online.coffee
* You may also nest objects within objects to provide namespacing within the same file
* @session gives you direct access to the current session
* @request gives you meta data regarding the RPC call (includes any HTTP POST data if present)

#### /app/shared
* See 'Sharing Code' section

#### /app/css
* /app/css/app.styl must exist. This should contain your stylesheet code in [Stylus](http://learnboost.github.com/stylus/) format (similar to SASS). You can also use plain CSS if you prefer.
* Additional Stylus files can be imported into app.styl using @import 'name_of_file'. Feel free to nest files if you wish.
* If you wish to use CSS libraries within your project (e.g. normalize.css or jQuery UI) put these in /lib/css instead, or feel free to link to hosted CDN files in /app/views/app/jade
* Stylus files are automatically compiled and served on-the-fly in development mode and pre-compiled/compressed/cached in staging and production

#### /app/views
* Either /app/views/app.jade or /app/views/app.html must exist. This should contain all the static layout HTML your app will ever need.
* Use [Jade](http://jade-lang.com/) format (similar to HAML) if you wish (recommended to ensure valid HTML syntax)
* The HTML HEAD tag must contain '!= SocketStream' in Jade, or '<SocketStream>' in plain HTML. This helper ensures all the correct libraries are loaded depending upon the environment (declared by SS_ENV)
* Easily nest additional HTML as jQuery templates (similar to Rails partials) in either Jade or plain HTML. E.g /app/views/people/customers/info.jade is accessible as $("#people-customers-info").tmpl(myData).
* Views and templates are automatically compiled and served on-the-fly in development and pre-compiled/compressed/cached in staging and production

#### /lib
* Changes to files within /lib/client or /lib/css automatically triggers re-compilation/packing/minification of client assets
* Any modules placed in /lib/server can easily be included within /app/server files with SS.require('my_module.coffee')
* New files added to these directories are not currently recognised (hence a server restart is needed). We will fix this soon
* Easily control the order your client libraries are loaded by prefixing them with a number (e.g. 1.jquery.js, 2.jquery-ui.js)
* Client JS files are automatically minified by [UglifyJS](https://github.com/mishoo/UglifyJS) unless the filename contains '.min'

#### /public
* Store your static files here (e.g. /public/images, robots.txt, etc)
* The /index.html file and /public/assets folder are managed by SocketStream and should not be touched