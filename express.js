// Entry point for app.js
'use strict';

var ss = require('./lib/socketstream.js'),
    express = ss.api.require('express');

module.exports = function() {
  var app = ss.http.middleware = express();

  app.listen = function() {
    ss.ws.listen.apply(ss.ws, arguments);
  };
  /* TODO
  app.socketstream = function( fn(req,stream) )

  app.stream = ss.http.stream;
  */
  app.stream = ss.http.stream;

  if (ss.env === 'development') {
    app.set('views', ss.client.dirs.views);
    // Showing stack errors
    app.set('showStackError', true);
    // Disable views cache
    app.set('view cache', false);
    // Environment dependent middleware
    require('express-debug')(app, {/* settings */});
  }

  return app;
};
