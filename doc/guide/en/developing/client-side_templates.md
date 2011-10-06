### Client-side Templates

Client-side templates are a vital part of any SocketStream application. They are used to transform incoming JSON data into chunks of HTML to be rendered in the browser.

If you've used Ruby on Rails before you'll find the idea very similar to partials; however, whereas Rails uses partials to generate HTML on the server, in SocketStream only raw data should be sent over the websocket. This not only dramatically reduces bandwidth, but also gives you flexibility to transform the data into HTML in a number of ways.

Note: SocketStream bundles jQuery and [jQuery Templates](http://api.jquery.com/category/plugins/templates) with every new project by default; however you are not forced to use either. Just delete the bundled files in /lib/client if you wish to use different libraries such as [Zepto](http://zeptojs.com) or [Mustache](https://github.com/janl/mustache.js).


#### Why use client-side templates?

If your app is really simple, you may be happy concatenating strings of HTML together and outputting them on screen using simple jQuery functions:

``` coffee-script
# Client-side code
SS.server.products.latest (products) ->
  products.forEach (product) ->
    $('#products').append("<li>A product called #{product.name} sells for <strong>#{product.price}</strong></li>")
```

However, this solution doesn't scale well; plus mixing display logic and HTML together in the same file is messy. Enter client-side templates.


#### jQuery Templates

To cleanup the example above let's make a new directory in /app/views called `templates`. Inside /app/views/templates create a file called `products.html` containing the following:

``` html
<li>A product called {{= name}} sells for <strong>{{= price}}</strong></li>
```

If you refresh the page and view the HTML source code you'll see a new `<script>` tag included with the other headers:

``` html
<script id="templates-products" type="text/x-jquery-tmpl"><li>A product called {{= name}} sells for <strong>{{= price}}</strong></li></script>
```

Note how the template ID has been automatically concatenated into `templates-products` based upon the name of the directory and file. You may create unlimited sub-directories of /app/views with any name you wish; hence a template with a path of /app/views/screens/admin/login.html would be given an ID of `screens-admin-login`.

Now we can clean up our display logic by passing the array of product data directly into the template we've just created:

``` coffee-script
# Client-side code
SS.server.products.latest (products) ->
  $('#templates-products').tmpl(products).appendTo('#products')
```

If you prefer, you may also use Jade to construct your HTML templates, simply name your template files `.jade`

Learn more about jQuery templates at http://api.jquery.com/category/plugins/templates/


#### Why not do all templating with Jade?

Because SocketStream is a single-page web framework which only uses Jade to serve the initial page of HTML. This is typically the layout; containing a header, navigation, sidebar, footer etc.

Once this initial 'payload' has been sent to the browser, no more HTML should ever be generated on the server. However, as you will note above, you may still use Jade to design the structure of your templates if you wish. In fact, we recommend you do.

