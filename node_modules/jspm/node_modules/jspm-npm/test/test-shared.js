var assert = require('assert');
var buffer = require('buffer');
var console = require('console');
var constants = require('constants');
var crypto = require('crypto');
var domain = require('domain');
var events = require('events');
var http = require('http');
var https = require('https');
var os = require('os');
var path = require('path');
var process = require('process');
var punycode = require('punycode');
var querystring = require('querystring');
var stream = require('stream');
var string_decoder = require('string_decoder');
var timers = require('timers');
var tty = require('tty');
var url = require('url');
var util = require('util');
var vm = require('vm');
var zlib = require('zlib');

assert.equal(new buffer.Buffer('base64 encoded').toString('base64'), 'YmFzZTY0IGVuY29kZWQ=');
assert.equal(constants.ENOENT, 2);

var shasum = crypto.createHash('sha1');
shasum.update('encode string');
assert.equal(shasum.digest('hex'), 'a994e8f7689b22efffc53f4fbad8c7e5798b703f');

var d = domain.create();
d.run(function() {

  var evt = new events.EventEmitter();
  evt.on('customEvent', function() {
    assert(http.get);
    assert(https.get);

    assert(os.platform());

    assert(path.join('one', 'two'), 'one' + path.sep + 'two');

    process.nextTick(function() {

      assert.equal(punycode.decode('maana-pta'), 'mañana');

      assert.equal(querystring.parse('a=b&c=d').c, 'd');

      assert(stream.Duplex);

      var decoder = new string_decoder.StringDecoder();
      assert.equal(new buffer.Buffer([0xE2, 0x82, 0xAC]), '€');

      timers.setTimeout(function() {

        assert(tty.isatty);

        assert.equal(url.parse('some/url?asdf').pathname, 'some/url');

        assert(util.isArray([]));

        var context = { count: 5 };
        vm.runInNewContext('count++;', context);
        assert.equal(context.count, 6);

        zlib.deflate(new buffer.Buffer('This is a test'), function(err, deflated) {
          assert(!err);
          zlib.inflate(deflated, function(err, inflated) {
            assert(!err);
            assert.equal(inflated.toString(), 'This is a test');

            var completeMsg = 'Shared tests passed successfully.';

            if (typeof document != 'undefined')
              document.body.innerHTML = completeMsg;

            console.log(completeMsg);

          });
        });

      });

    });

  });
  evt.emit('customEvent');

});