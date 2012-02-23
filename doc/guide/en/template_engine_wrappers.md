# Template Engine Wrappers

Writing your own template engine wrapper is easy. For this quick tutorial we'll be looking at a [ss-hogan](https://github.com/socketstream/ss-hogan), a wrapper for Twitter's [Hogan library](http://twitter.github.com/hogan.js/).

You can see the file structure for a template engine wrapper in the [ss-hogan repository]([ss-hogan](https://github.com/socketstream/ss-hogan)). Let's look at the key file, `engine.js`:

```javascript
/* lib/engine.js */

var hogan = require('hogan');

exports.init = function(root, config) {

  // Set global/window variable used to access templates from the browser
  var namespace = config && config.namespace || 'HT'

  return {

    name: 'Hogan',

    // Opening code to use when a Hogan template is called for the first time
    prefix: function() {
      return '<script type="text/javascript">if(!window.' + namespace + '){window.' + namespace + ' = {};}';
    },

    // Closing code once all Hogan templates have been written into the <script> tag
    suffix: function() {
      return '</script>';
    },

    // Compile template into a function and attach to window.<namespace>
    process: function(template, path, id) {

      var compiledTemplate = hogan.compile(template, {asString: true});

      return 'window.' + namespace + '[\'' + id + '\'] = new Hogan.Template(' + compiledTemplate + ');';
    }
  }
}
```

Here `prefix` and `suffix` are called one time each. In between those calls, `process` gets called for every file this template engine handles.

In this example, the wrapper is compiling templates on the server side, then passing the compiled templates to the client. The `prefix` and `suffix` functions wrap the compiled templates inside a `<script>` tag, so that the templates are ready to use when the page loads.


### Selecting a Formatter (optional)

Formatters are used to transform the contents of each template **before** it is sent to the template engine.

By default SocketStream selects a formatter based on the template file's extension. Most of the time this will prove useful (e.g. automatically transforming .jade files to HTML), but occasionally you will need to overwrite this behavior (e.g. if you want the .jade file to be sent to the template engine as-is).

Simply add a `selectFormatter` function to your engine:

```javascript
/* lib/engine.js */

exports.init = function (root, config) {
  // ...
  return {
    // ...
    selectFormatter: function (path, formatters, defaultFormatter) {
      return defaultFormatter;
    },
    // ...
  }
};
```

* `path` is the path of the template file relative to the `client/templates` folder
* `formatters` is a map of formatters SocketStream already knows about:
    * Each key is a file extension (without a dot `.`)
    * Each value is a formatter for that extension type
* `defaultFormatter` is the formatter that SocketStream selects by default

The formatter that `selectFormatter` returns is the formatter that SocketStream will use to render the template **before** passing it to the template engine's `process` function. If you return `false`, SocketStream will pass the contents of the file directly to the template engine without any pre-processing.


### Tips

When building your own template wrapper be sure to consider the following points:

* Should you pre-compile the templates on the server before sending them over the wire? (generally a good idea)
* Does the browser need a VM (small client-side lib) to render the templates?

Try to pick the best trade off between performance and overall bytes sent to the client, bearing in mind it's not uncommon for a large app to have 50 or more templates.

If a client-side VM is needed to render the template (as is normally the case), be sure document this in your modules README file and provide a link. In the future we will make it possible to automatically send any client-side dependencies to the browser. Stay tuned.