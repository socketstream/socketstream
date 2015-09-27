'use strict';

var EventEmitter2 = require('eventemitter2').EventEmitter2,
    path          = require('path');

/**
 * @ngdoc service
 * @name http.router:router
 * @function
 *
 * @description
 * Right now the router is simply an EventEmitter. This may change in the future
 */
exports.Router = Router;

function Router() {
  this.ee = new EventEmitter2({
    wildcard: true,
    delimiter: '?'
  });
}

/**
 * @ngdoc service
 * @name http.router:router#route
 * @methodOf http.router:router
 * @function
 *
 * @description
 * Try the original route first for speed. If none exists, recursively fall back until we find a route, if possible
 * This allows us to fully support HTML5 pushState 'mock routing' across multiple single-page clients
 *
 * @param  {String} url Url to route
 * @param  {Object} req Request object
 * @param  {Object} res Respond object
 * @return {Boolean}    Route state according to passed `url`
 */
Router.prototype.route = function(url, req, res) {
  var newUrl = '',
      sr     = [];

  // TODO allow for wildcards with listeners = @ee.listeners(url) - @ee.listenersAny(url)
  if (this.ee.listeners(url).length > 0) {
    this.ee.emit(url, req, res);

    return true;

  } else {
    if (url === '/') {
      return false;
    }

    /*
       if a file name extension exists on url forward request to middleware
       will return 404 if invalid
       this terminates the recursive call up the route stack
     */
    if(path.extname(url) !== ''){
      return false;
    }

    if (url.indexOf('?') >= 0) {
      sr = url.split('?');

    } else {
      sr = url.split('/');
    }

    sr.pop();

    newUrl = sr.join('/');

    if (newUrl.length === 0) {
      newUrl = '/';
    }

    return this.route(newUrl, req, res);
  }
};

/**
 * @ngdoc service
 * @name http.router:router#on
 * @methodOf http.router:router
 * @function
 *
 * @description
 *
 * @param  {String}   url Url to route
 * @param  {Function} cb  Callback function for `url`
 * @return {Object}       this.ee instance
 */
Router.prototype.on = function(url, cb) {
  if (url.substring(0, 1) === '/' && url.indexOf(' ') === -1) {
    return this.ee.on(url, cb);

  } else {
    throw new Error(url + ' is not a valid URL. Valid URLs must start with /');
  }
};
