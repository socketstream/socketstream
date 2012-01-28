var fs, pathlib, wrap;

require('colors');

fs = require('fs');

pathlib = require('path');

exports.init = function(root) {
  return {
    generate: function(root, templatePath, files, formatters, cb) {
      var templates;
      templates = [];
      return files.forEach(function(path) {
        var extension, formatter, fullPath;
        extension = pathlib.extname(path);
        if (extension) extension = extension.substring(1);
        formatter = formatters[extension];
        if (formatter == null) {
          throw new Error("Unable to load client side template " + path + " because no formatter exists for ." + extension + " files");
        }
        if (formatter.assetType !== 'html') {
          throw new Error("Formatter is not for HTML files");
        }
        fullPath = pathlib.join(root, templatePath, path);
        return formatter.compile(fullPath, {}, function(output) {
          templates.push(wrap(path, output));
          if (templates.length === files.length) return cb(templates.join(''));
        });
      });
    }
  };
};

wrap = function(path, template) {
  var id, sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) sp.pop();
  id = 'tmpl-' + sp.join('.').replace(/\//g, '-');
  return '<script id="' + id + '" type="text/x-tmpl">' + template.toString() + '</script>';
};
