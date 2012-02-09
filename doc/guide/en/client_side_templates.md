# Client-Side Templates

SocketStream's client-side templates generate HTML in the browser, allowing SocketStream to send raw, layoutless data over the websocket. This not only dramatically reduces bandwidth, but also gives you flexibility to render the data into HTML in any number of ways.

**NOTE:** This tutorial uses the [Hogan](http://twitter.github.com/hogan.js/) templating library. You can configure SocketStream to [use other templating libraries](#), or even [write a wrapper](#) for your own favorite library.


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



#### Why not do all templating with Jade?

Because SocketStream is a single-page web framework which only uses Jade to serve the initial page of HTML. This is typically the layout; containing a header, navigation, sidebar, footer etc.

Once this initial 'payload' has been sent to the browser, no more HTML should ever be generated on the server. However, as you will note above, you may still use Jade to design the structure of your templates if you wish. In fact, we recommend you do.

