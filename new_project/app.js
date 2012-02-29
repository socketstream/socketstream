// My SocketStream app

var http = require('http')
  , ss = require('socketstream');

ss.client.define('main', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'modules', 'main']
});

ss.http.router.on('/', function(req, res) {
  res.serveClient('main');
});

// Remove to use only plain .js, .html and .css files if you prefer
ss.client.formatters.add(require('ss-coffee'));
ss.client.formatters.add(require('ss-jade'));
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// Minimise and pack assets if you type: SS_ENV=production node app.js
if (ss.env == 'production') ss.client.packAssets();

// Enable optional console server access. Install client with 'npm install -g ss-console'
var consoleServer = require('ss-console').init(ss);
consoleServer.listen(5000);

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

ss.start(server);