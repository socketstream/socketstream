var engine, headers, magicPath, pathlib, tag, templates;

pathlib = require('path');

magicPath = require('./magic_path');

engine = require('./template_engine');

module.exports = function(root, client, options, cb) {
  var asset, htmlOptions, includes;
  asset = require('./asset').init(root, options);
  includes = headers(root, client, options);
  includes = includes.concat(templates(root, client, options));
  htmlOptions = {
    headers: includes.join(''),
    compress: client.pack,
    filename: client.paths.view
  };
  return asset.html(client.paths.view, htmlOptions, cb);
};

templates = function(root, client, options) {
  var dir, files, output;
  dir = pathlib.join(root, options.dirs.templates);
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

headers = function(root, client, options) {
  var output, _ref, _ref2, _ref3, _ref4;
  output = [];
  if (client.pack) {
    output.push(tag.css(((_ref = options.packAssets) != null ? (_ref2 = _ref.cdn) != null ? _ref2.css : void 0 : void 0) || ("/assets/" + client.name + "/" + client.id + ".css")));
    output.push(tag.js(((_ref3 = options.packAssets) != null ? (_ref4 = _ref3.cdn) != null ? _ref4.js : void 0 : void 0) || ("/assets/" + client.name + "/" + client.id + ".js")));
  } else {
    output.push(tag.js("/_serveDev/system?ts=" + client.id));
    client.paths.css.forEach(function(path) {
      return magicPath.files(pathlib.join(root, options.dirs.css), path).forEach(function(file) {
        return output.push(tag.css("/_serveDev/css/" + file + "?ts=" + client.id));
      });
    });
    client.paths.code.forEach(function(path) {
      return magicPath.files(pathlib.join(root, options.dirs.code), path).forEach(function(file) {
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
