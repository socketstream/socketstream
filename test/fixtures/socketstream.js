'use strict';

var ss = module.exports = require('../../lib/socketstream');
ss.root = ss.api.root = require('./index').project;

ss.client.reset = function() {
  ss.client.unload();
  ss.client.forget();
  ss.client.init();
  ss.tasks.unload();
  ss.tasks.forget();
};

ss.tasks.reset = function() {
  ss.tasks.forget();
};
