0.3 alpha2 / 2012-02-01
=======================

New modular client-side Template Engines:

* Supports server-side compiled Hogan templates using the optional `ss-hogan` npm module
* Supports server-side compiled CoffeeKup templates using the optional `ss-coffeekup` npm module
* Supports Ember.js 'reactive' templates - a perfect compliment to SocketStream
* Easily create an template engine module for your preferred template language and share it on npm
* Best feature: Mix and match different types of templates in your project - perfect for experimenting or converting from one to another
* Now bundling server-side Hogan template solution as the default (when creating a new project). Demo updated to demonstrate use of Hogan templates. Note `socketstream new` will create a 'bare-bones' project in the future whereas `socketstream new -r` will install our recommended stack + chat demo
* In the absence of proper docs for templating so far, please look at the Alpha 2 announcement on our Google Group

* Tidied up and improved README
* Better resolving of nested routes (with dots in) to single-page clients by caching names of static dirs upon startup
* Warns if you try to define a single-page client which conflicts with the name of a file or folder in /clients/static
* New projects are bundled with reset.css (http://meyerweb.com/eric/tools/css/reset/) as in 0.2 instead of bootstrap.css
* Experimenting with new loadAsync() command to load in additional client-side modules. See post in Google Group
* Any old files in /client/static/assets are now deleted by default. Override with {keepOldFiles: true}
* Backwards slashes (\) replaced with forward slashes (/) in file paths for Windows compatibility (David Rosen)
* Updated INSTALL.md


0.3 alpha1 / 2012-01-14
=======================

Huge changes to pretty much everything since 0.2.7. See README for full details.

All archived history in the 0.2 branch: https://github.com/socketstream/socketstream/blob/0.2/HISTORY.md
