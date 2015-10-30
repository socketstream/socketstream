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

  return app;
};
