'use strict';

var   ss      = require( '../../../lib/socketstream');

module.exports = defineAbcClientAndLoad;

function defineAbcClient(conf) {
  var r = {
    css: './abc/style.css',
    code: './abc/index.js',
    view: './abc/abc.html',
    tmpl: './templates/abc/1.html'
  };
  for(var k in conf) {
    if (conf[k] === undefined) { delete r[k]; }
    else if (k !== 'custom') { r[k] = conf[k]; }
  }
  return conf.custom? ss.client.define('abc',conf.custom,r) : ss.client.define('abc',r);
}

function defineAbcClientAndLoad(conf,run,load) {
  var client = defineAbcClient(conf);
  if (run) {
    run();
  }
  if (load !== false) {
    ss.api.bundler.load();
    ss.api.client.templateEngines = ss.client.templateEngine.load();
    ss.api.client.formatters = ss.client.formatters.load();

    ss.tasks.defaults();
  }

  return client;
}

module.exports.reset = function() {
  ss.client.unload();
  ss.client.forget();
  ss.tasks.unload();
  ss.tasks.forget();
};
