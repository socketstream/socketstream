// HTTP Router
// -----------
// Right now the router is simply an EventEmitter. This may change in the future

var EventEmitter2;

EventEmitter2 = require('eventemitter2').EventEmitter2;

exports.Router = (function() {

  function Router() {
    this.ee = new EventEmitter2({
      wildcard: true,
      delimiter: '?'
    });
  }

  // Try the original route first for speed. If none exists, recursively fall back until we find a route, if possible
  // This allows us to fully support HTML5 pushState 'mock routing' across multiple single-page clients
  Router.prototype.route = function(url, req, res) {
    var newUrl, sr;

    // TODO allow for widcards with listeners = @ee.listeners(url) - @ee.listenersAny(url)    
    if (this.ee.listeners(url).length > 0) {
      this.ee.emit(url, req, res);
      return true;
    } else {
      if (url === '/') {
        return false;
      }
      if (url.indexOf('?') >= 0) {
        sr = url.split('?');
      } else {
        sr = url.split('/');
      }
      sr.pop();
      newUrl = sr.join('/');
      if (!(newUrl.length > 0)) {
        newUrl = '/';
      }
      return this.route(newUrl, req, res);
    }
  };

  Router.prototype.on = function(url, cb) {
    if (url.substring(0, 1) === '/' && url.indexOf(' ') === -1) {
      return this.ee.on(url, cb);
    } else {
      throw new Error(url + ' is not a valid URL. Valid URLs must start with /');
    }
  };

  return Router;

})();
