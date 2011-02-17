0.0.3 / 2011-02-17
==================

  * New feature: Initial work towards API. remote('app.square', 5) can now also be called by /api/app/square.json?5 (or .html to view on screen). Passed params will be sent as objects. Full error handling and API browsing coming soon.
  * New feature: Configure the client using the 'client' params in your local /config/environments/<NODE_ENV>.json files. E.g. {"client": {"log_level":3}}
  * Improvement: Refactored incoming request code
  
  
0.0.2 / 2011-02-13
==================

  * New feature: Share code between client and server by placing it in /app/shared
  * New feature: jQuery templating. Just add the jQuery tmpl plugin to your /lib/client files then create folders and files within /app/views
  * New feature: Easily override default config with app config files in /config/environments/<NODE_ENV>.json
  * Improvement: /app/vendor directory now optional
  * Improvement: Client-side debugging is now set using the same $SS.config.log_level variable as server-side for consistency
  * Improvement: Refactored to use fewer global variables, more modular, more comments
  * Added this file
  

0.0.1 / 2011-01-14
==================

  * Initial release