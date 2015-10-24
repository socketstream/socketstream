'use strict';

var ss = module.exports = require('../../lib/socketstream');
ss.root = ss.api.root = require('./index').project;

var apiKeys = Object.keys(ss.api);

ss.reset = function() {
  for(var key in ss.api) {
  	if (apiKeys.indexOf(key) >= 0) {
  	  delete ss.api[key];	
  	}
  }		
  ss.client.reset();
};

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
