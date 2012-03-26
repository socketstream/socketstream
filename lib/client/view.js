var asset, engine, headers, magicPath, pathlib, tag, templates;

pathlib = require('path');

magicPath = require('./magic_path');

asset = require('./asset');

engine = require('./template_engine');

module.exports = function(root, client, cb) {
  var includes, options;
  includes = headers(root, client);
  includes = includes.concat(templates(root, client));
  options = {
    headers: includes.join(''),
    compress: client.pack,
    filename: client.paths.view
  };
  return asset.html(root, client.paths.view, options, cb);
};

templates = function(root, client) {
  var dir, files, output;
  dir = pathlib.join(root, 'client/templates');
  output = [];
  if (client.paths.tmpl) {
    files = [];
    client.paths.tmpl.forEach(function(tmpl) {
      return files = files.concat(magicPath.files(dir, tmpl));
    });
    engine.generate(dir, files, function(templateHTML) {
      return output.push(templateHTML);
    });
  }
  return output;
};

headers = function(root, client) {
  var output;
  output = [];
  if (client.pack) {
    output.push(tag.css("/assets/" + client.name + "/" + client.id + ".css"));
    output.push(tag.js("/assets/" + client.name + "/" + client.id + ".js"));
  } else {
    output.push(tag.js("/_serveDev/system?ts=" + client.id));
    client.paths.css.forEach(function(path) {
      return magicPath.files(root + '/client/css', path).forEach(function(file) {
        return output.push(tag.css("/_serveDev/css/" + file + "?ts=" + client.id));
      });
    });
    client.paths.code.forEach(function(path) {
      return magicPath.files(root + '/client/code', path).forEach(function(file) {
        return output.push(tag.js("/_serveDev/code/" + file + "?ts=" + client.id + "&pathPrefix=" + path));
      });
    });
    output.push(tag.js("/_serveDev/start?ts=" + client.id));
  }
  return output;
};

tag = {
  css: function(path) {
    return '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css">';
  },
  js: function(path) {
    return '<script src="' + path + '" type="text/javascript"></script>';
  }
};
