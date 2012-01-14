var coffee, fs;

fs = require('fs');

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
      var ext, input, output;
      output = [];
      ['json.min.js', 'console_log.min.js', 'event_emitter.js'].forEach(function(file) {
        return output.push(fs.readFileSync(__dirname + '/libs/' + file, 'utf8'));
      });
      ext = (coffee != null) && 'coffee' || 'js';
      input = fs.readFileSync(__dirname + '/init.' + ext, 'utf8');
      output.push((coffee != null) && coffee.compile(input) || input);
      if (transport.client().code != null) output.push(transport.client().code());
      responders.forEach(function(responder) {
        return output.push(responder.client.code());
      });
      output.push("window.ss = window.SocketStream.apis;\nSocketStream.transport.connect();\n");
      return cb(output.join("\n"));
    }
  };
};
