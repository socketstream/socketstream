
var fs;
try {
  fs = require('graceful-fs');
} catch(err) {
  fs = require('fs');
}

require('thenify-all')(fs, exports, [
  'rename',
  'ftruncate',
  'chown',
  'fchown',
  'lchown',
  'chmod',
  'fchmod',
  'stat',
  'lstat',
  'fstat',
  'link',
  'symlink',
  'readlink',
  'realpath',
  'unlink',
  'rmdir',
  'mkdir',
  'readdir',
  'close',
  'open',
  'utimes',
  'futimes',
  'fsync',
  'write',
  'read',
  'readFile',
  'writeFile',
  'appendFile',
])

var promisify = require('thenify')

// don't know enough about promises to do this haha
exports.exists = promisify(function exists(filename, done) {
  fs.stat(filename, function (err) {
    done(null, !err)
  })
})
