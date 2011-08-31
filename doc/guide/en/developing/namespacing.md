### Namespacing (Client and Shared code)

One of the trickiest problems to solve in this new exciting world of rich JavaScript-based web apps is where to put all of those files and how to organise them as your project grows.

SocketStream's novel approach is to turn all your Client and Shared files into an 'API tree' which can be called from a global variable (`SS.client` and `SS.shared` respectively). Server code works slightly differently but essentially follows the same API Tree approach (in this case for `SS.server`).

The rule is simple: Every object, function and variable will automatically remain private inside your file unless you prefix it with 'exports.'. Once you do, it will be added to the API tree and can be easily referenced or invoked from any file in the same environment.

For example, let's create a file called /app/client/navbar.coffee and paste the following in it:

``` coffee-script
areas = ['Home', 'Products', 'Contact Us']

exports.draw = ->
  areas.forEach (area) ->
    render(area)
    console.log(area + ' has been rendered')

render = (area) ->
  $('body').append("<li>#{area}</li>")
```
    
In this case the `draw` method has been made public and can now be executed by calling `SS.client.navbar.draw()` from anywhere in your client code, or directly in the browser's console. The `areas` variable and `render` function both remain private within that file (thanks to closures) and will never pollute the global namespace.

Nested namespaces using multiple folders and deep object trees are fully supported. SocketStream does a quick check when it starts up to ensure file and folder names don't conflict in the same branch. We think API trees are one of the coolest features of SocketStream. Let us know what you think.

**Tip** If you'd like to save on keystrokes, feel free to alias `SS.client` with something shorter. E.g:

``` coffee-script
window.C = SS.client

C.navbar.draw()
```