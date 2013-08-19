// Serve Views
// -----------
// Extend Node's HTTP http.ServerResponse object to serve views either from a cache (in production)
// or by generating them on-the-fly (in development)
// Note: Even though this is exactly what Express.js does, it's not best practice to extend Node's native
// objects and we don't be doing this in SocketStream 0.4

var cache, fs, http, pathlib, res, view;

require('colors');

fs = require('fs');

pathlib = require('path');

http = require('http');

view = require('./view');

// Cache each view in RAM when packing assets (i.e. production mode)
cache = {};

// Get hold of the 'response' object so we can extend it later
res = http.ServerResponse.prototype;

module.exports = function(ss, clients, options) {

  // Append the 'serveClient' method to the HTTP Response object  
  res.serveClient = function(name) {
    var client, fileName, self, sendHTML;
    self = this;
    sendHTML = function(html, code) {
      if (code == null) {
        code = 200;
      }
      self.writeHead(code, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': 'text/html'
      });
      return self.end(html);
    };
    try {
      client = typeof name === 'string' && clients[name];
      if (client == null) {
        throw new Error('Unable to find single-page client: ' + name);
      }

      // Load packed HTML file      
      if (options.packedAssets) {

        // Return from in-memory cache if possible        
        if (!cache[name]) {
          fileName = pathlib.join(ss.root, options.dirs.assets, client.name, client.id + '.html');
          cache[name] = fs.readFileSync(fileName, 'utf8');
        }

        // Send to browser
        return sendHTML(cache[name]);
      } else {
        // Generate View from scratch in development         
        return view(ss, client, options, sendHTML);
      }
    } catch (e) {
      // Never send stack trace to the browser, log it to the terminal instead      
      sendHTML('Internal Server Error', 500);
      ss.log('Error: Unable to serve HTML!'.red);
      return ss.log(e);
    }
  };

  // Alias res.serveClient to keep compatibility with existing apps  
  return res.serve = res.serveClient;
};