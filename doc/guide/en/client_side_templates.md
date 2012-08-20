# Client-Side Templates

Client-side templates generate HTML in the browser, allowing SocketStream to send raw, layoutless data over the websocket. This not only dramatically reduces bandwidth, but also gives you flexibility to render the data into HTML in any number of ways.


### Why use client-side templates?

If your app is really simple, you might be happy manually building your HTML using jQuery functions:

``` coffee-script
# client/code/main/index.coffee
people = [
  { name:'Alice', major:'Astronomy' }
  { name:'Bob',   major:'Biology' }
]
$(document).ready ->
  for person in people
    $('#people').append("<li>#{person.name} the student studies <strong>#{person.major}</strong></li>")
```

However, not only does this solution scale poorly for larger templates, but mixing together display logic and HTML is bad practice. Enter client-side templates.


### Template Engines

SocketStream supports two types of client-side template engines out-of-the-box:

##### ember
Outputs inline templates in the correct format for Ember.js.

##### angular
Outputs inline templates in the correct format for Angular.js.

##### default
Simply wraps each template in a DIV tag with an ID prefix of 'tmpl-'. Suitable for use with many template engines, including jQuery Templates (as used by SocketStream 0.2).


To use a built-in template engine, pass the name as a string:

```javascript
ss.client.templateEngine.use('ember');
```

As built-in template engines are only simple wrappers, most of the time you'll want to use one of the several template languages supported via optional modules on npm:

* [ss-hogan](https://github.com/socketstream/ss-hogan) Mustache templates (compiled on the server, requires small client-side lib). This is our recommended template engine.
* [ss-coffeekup](https://github.com/socketstream/ss-coffeekup) CoffeeKup templates (compiled on the server, no client-side code required)
* [ss-clientjade](https://github.com/sveisvei/ss-clientjade) Client-side Jade templates (compiled on the server, requires small client-side lib)

To use an external optional template engine, pass the module as so:

```javascript
ss.client.templateEngine.use(require('ss-hogan'));
```

If you can't find a module for your favorite templating library it's easy to [create your own](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md).


### Mix and match different template engines

All client-side templates live in the `client/templates` folder; however you don't have to serve every template with the same engine.

SocketStream allows you to mix and match different templates, perfect for trying out something like Ember.js without having to convert all your exiting templates over at once.

You may limit the scope of a template engine by passing the name of a directory as the second argument.

```javascript
// serve all templates with ss-hogan
ss.client.templateEngine.use(require('ss-hogan'));
// apart from any in the /client/templates/em directory
ss.client.templateEngine.use('ember', '/em');
```


### Example

Here we're using the [Hogan](http://twitter.github.com/hogan.js/) templating library, using the `ss-hogan` module bundled by default when you create a new project.

In this folder, let's create a file called `person.html`:

``` html
<!-- client/templates/person.html -->
<li>{{ name }} the student studies <strong>{{ major }}</strong></li>
```

**NOTE:** If you prefer, you may use a formatter to construct your HTML templates. For example, to use Jade, use `.jade` instead of `.html` for your template's file extension.

If you refresh the page and view the HTML source code you'll see a new `<script>` tag containing the compiled template.

The `person.html` file in the `templates` folder is now accessible via `ss.tmpl['person']`. If the file was in a subdirectory `model/person.html`, then it would be accessible via `ss.tmpl['model-person']`.

Now that we have a template, let's put it to good use by refactoring our code:

``` coffee-script
# in your client-side code
people = [
  { name:'Alice', major:'Astronomy' }
  { name:'Bob',   major:'Biology' }
]
$(document).ready ->
  for person in people
    $('#people').append ss.tmpl['person'].render(person)
```


### Serving different templates to different clients

By default all templates will be sent to all single-page clients you define with:

``` javascript
ss.client.define()
```

However, by organizing your templates into directories, you can specify which templates will be sent to each client as so:


``` javascript
// app.js
ss.client.define('iphone', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'app'],
  tmpl: ['main', 'mobile']  // will only send templates in the 'main' and 'mobile' directories
});
```



