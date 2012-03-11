var coffee, fs, fsUtils;

fs = require('fs');

fsUtils = require('../utils/file');

if (process.env['SS_DEV']) coffee = require('coffee-script');

exports.init = function(transport, responders) {
  return {
    html: function(cb) {
      var output;
      output = [];
      if (transport.client().html != null) output.push(transport.client().html());
      return cb(output.join('\n'));
    },
    code: function(cb) {
      var code, modDir, name, output, responder, systemMods;
      output = [];
      ['json.min.js', 'console_log.min.js'].forEach(function(file) {
        return output.push(fs.readFileSync(__dirname + '/libs/' + file, 'utf8'));
      });
      output.push(fs.readFileSync(__dirname + '/browserify.js', 'utf8'));
      systemMods = {};
      modDir = __dirname + '/system_modules';
      fsUtils.readDirSync(modDir).files.forEach(function(mod) {
        var code, ext, input, sp;
        input = fs.readFileSync(mod, 'utf8');
        sp = mod.split('.');
        ext = sp[sp.length - 1];
        code = ext === 'coffee' && (coffee != null) && coffee.compile(input) || input;
        return systemMods[mod.substr(modDir.length + 1)] = code;
      });
      if (transport.client().libs != null) {
        output.push(transport.client().libs() + "\n");
      }
      if (transport.client().code != null) {
        systemMods['socketstream-transport'] = transport.client().code();
      }
      for (name in responders) {
        responder = responders[name];
        systemMods['socketstream-' + name] = responder.client.code();
      }
      for (name in systemMods) {
        code = systemMods[name];
        output.push("require.define(\"" + name + "\", function (require, module, exports, __dirname, __filename){\n" + code + " \n});");
      }
      for (name in responders) {
        responder = responders[name];
        output.push("require('socketstream-" + name + "');");
      }
      return cb(output.join("\n"));
    }
  };
};
