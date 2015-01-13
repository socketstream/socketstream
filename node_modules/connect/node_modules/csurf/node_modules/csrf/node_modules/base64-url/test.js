var tape = require('tape');
var base64url = require('./index');

tape('base64', function(assert) {
  assert.plan(4);

  var text = 'Node.js is awesome.';

  var encode = base64url.encode(text);
  assert.ok(encode, 'encode: ' + encode);

  var decode = base64url.decode(encode);
  assert.deepEqual(decode, text, 'decode: ' + decode);

  var textEscape = 'This+is/goingto+escape==';

  var escape = base64url.escape(textEscape);
  assert.equal(escape.match(/\+|\//g), null,
    'escape (omit + and /): ' + escape);

  var unescape = base64url.unescape(escape);
  assert.equal(unescape.match(/\-|_/g),
    null,
    'unescape (back to first form): ' + unescape);
});
