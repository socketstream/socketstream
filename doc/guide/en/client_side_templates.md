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


### Multiple Templates Engines supported


This tutorial uses the [Hogan](http://twitter.github.com/hogan.js/) templating library, using the `ss-hogan` module bundled by default when you create a new project.

A number of other template languages are supported by SocketStream using third-party modules on NPM:

[ss-coffeekup](https://github.com/socketstream/ss-coffeekup) CoffeeKup templates (compiled on the server, no client-side code required)
[ss-clientjade](https://github.com/sveisvei/ss-clientjade) Client-side Jade templates (compiled on the server, requires small client-side lib)

If you can't find a module for your favorite templating library it's easy to [create your own](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md).


### A New Home

Client-side templates live in the `client/templates` folder. In this folder, let's create a file called `person.html`:

``` html
<!-- client/templates/person.html -->
<li>{{ name }} the student studies <strong>{{ major }}</strong></li>
```

**NOTE:** If you prefer, you may use a formatter to construct your HTML templates. For example, to use Jade, use `.jade` instead of `.html` for your template's file extension.

If you refresh the page and view the HTML source code you'll see a new `<script>` tag containing the compiled template:

``` javascript
HT['person'] = new Hogan.Template( /* ...compiled template... */ );
```

Note how `person.html` in the `templates` folder is accessible via `HT['person']`. If the file was in a subdirectory `model/person.html`, then it would be accessible via `HT['model-person']`.

Now that we have a template, let's put it to good use by refactoring our code:

``` coffee-script
# client/code/main/index.coffee
people = [
  { name:'Alice', major:'Astronomy' }
  { name:'Bob',   major:'Biology' }
]
$(document).ready ->
  for person in people
    $('#people').append HT['person'].render(person)
```


### Serving different templates to different clients

By default all templates will be sent to all single-page clients you define with:

    ss.client.define()

However, by organizing your templates into directories, you can specify which templates will be sent to each client as so:


``` javascript
// app.js
ss.client.define('iphone', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'modules', 'main'],
  tmpl: ['main', 'mobile']  // will only send templates in the 'main' and 'mobile' directories
});
```



