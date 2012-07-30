# Client-Side Code

SocketStream allows you to write and structure client-side Javascript in exactly the same way as server-side code, allowing you to easily share modules between both.


### How to use Modules

All files which aren't `libs` (see below) are treated as modules. You have exactly the same ability to export functions, `require()` other modules, and cache values within modules as you do when writing server-side code in Node.js.

Client-side code lives in `/client/code`. Create as many subdirectories as you wish. Reference your modules relatively, e.g. `require('../../image/processor')`, or absolutely `require('/path/to/my/module.js')`. It all work as you would expect, just bear in mind a module will never be executed unless it is explicitly `require()`'d.

Top tip: Type `require.modules` in the browser console to see a list of all modules you can `require()` in your app


### Special Exceptions

While we try to keep the experience between browser and server as similar as possible, there are a few special cases to be aware of:


#### 'libs' - Legacy (non Common JS) Libraries

Any file which lives in a directory called 'libs' will NOT be served as a module. Instead these files will be sent as-is without any modification. Typically you'll want to ensure jQuery and other libraries which use the `window` variable are always placed in a `/client/code` directory called 'libs'.

As load order is critically important for non Common JS libraries **either** name your files alphanumerically within the `libs` directory **or** list each file explicitly in your `ss.client.define()` command - your choice.


#### 'system' - System Modules

System modules are similar to regular modules but with one important difference: they are accessed without a leading slash - just like you would `require('url')` or `require('querystring')` in Node.js.

So why do we need this distinction? Because some libraries such as Backbone.js (when used as a module, rather than in a 'libs' directory) depend upon other system modules. In this case Backbone calls `require('underscore')` internally, therefore both `backbone.js` and `underscore.js` must live in a `system` directory.

As SocketStream uses code from [Browserify](https://github.com/substack/node-browserify), the 'system' directory also allows you to use one of Node's inbuilt modules in the browser. Just head over to https://github.com/substack/node-browserify/tree/master/builtins and copy the libraries you need into any directory within `/client/code` called `system`.

Tip: If you're making a new folder called `/client/code/system`, don't forget to add `system` to the list of code directores to serve in the `ss.client.define()` statement within `app.js`.


#### '/entry.js' - A single point of entry

The `entry` module has a special distinction: it is the only module to be required automatically once all files have been sent to the browser.

An `entry.js` (or `entry.coffee`) file is created for you by default when you make a new project. It contains a small amount of boiler-plate code which you may modify to handle the websocket connection going down, reconnecting, and (critically), what module to `require()` next once the websocket connection is established.


### Should I put library X in 'libs' or 'system'?

It depends if it needs access to the `window` variable. For example, Backbone.js works great as a `system` module unless you're using Backbone.history as this requires access to `window`.


### What happens if I try to require a module which doesn't exist?

You'll see an error in the browser's console. In the future SocketStream will be able to catch these problems before they arise.


### Loading modules on demand

You don't necessarily have to send all modules to the browser at once, you can also [load them on demand](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/loading_assets_on_demand.md).


### Background info

Getting client-code right was a major goal for SocketStream from the beginning.

For too long web developers have had to wade through a mess of unstructured JavaScript files without anyway to manage namespacing or dependencies.

Solutions such as [Require.js](http://requirejs.org) and other AMD approaches have successfully brought order to chaos, but put the onus on the developer to manually track and list dependencies. What's more, they use a different syntax to `require()` files - instantly killing all hopes of sharing the same file between the client and server.

We wanted to do much better with SocketStream. After all, we are in the unique position of managing both the client and server stack. The solution came in the form of [Browserify](https://github.com/substack/node-browserify) - an awesome, lightweight, library which solves all these problems once and for all.

SocketStream doesn't depend upon the Browserify module (as it contains code we don't need), but we use major components from it (including the critical code which performs all the `require()` magic). Our thanks go to Substack for coming up with a clean solution to a very tricky problem.
