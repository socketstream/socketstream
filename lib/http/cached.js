'use strict';
/**
 * Ensure that content is up-to-date in edge caches
 */

var parseurl = require('parseurl'),
	send = require('send'),
	glob = require('glob'),
	path = require('path');

/*
 Files in static directory are cached and files as is under root.

 Files in assets directory are cached and served under `assets/` with their location in the file syste.
 Files ending with .index.html are served as index files.

 Known paths are remembered either pointing to a file on the fs or by in memory content.
 */

module.exports = function cached(ss) {

	// known endpoints are cached by path
	var byPath = {};

	function KnownPoint(url, fn, filePath) {
		this.url = url;
    if (fn) { this.handle = fn; }
    if (filePath) { this.filePath = filePath; }

		byPath[url] = this;
	}

	KnownPoint.prototype.options = {};

	KnownPoint.prototype.handle = function(req, res, next) {
		if (this.content) {
      // res.statusCode = 303
			res.setHeader('Content-Type', this.mimeType || 'text/plain');
      res.setHeader('Location', this.url)
			res.end(this.content);
			return;
		}

		if (this.filePath) {
			var stream = send(req, this.filePath, this.options);

			if (next) {
				// forward non-404 errors
				stream.on('error', function error(err) {
					next(err.status === 404? null : err);
				});
			}

			stream.pipe(res);
			return;
		}

		if (next) { next(); }
	};

	function getPoint(req) {
		var url;
		if (typeof req === 'string') {
			url = { path:req, pathname: req };
		} else {
		    if (req.method !== 'GET' && req.method !== 'HEAD') {
		      return null;
		    }
		    url = parseurl(req,true);

		}
		var point = byPath[url.path] || byPath[url.pathname];
		return point;
	}


	function route(url, fn, filePath) {
		if (url.charAt(0) !== '/') { url = '/'+url; }
		// console.log('route defined',url);
		var point = getPoint(url);
		if (point) {
			if (fn) { point.handle = fn; }
			if (filePath) { point.filePath = filePath; }
		} else {
			point = new KnownPoint(url, fn, filePath);
		}
	}

	return {
		get middleware() {
			return cachedMiddleware;
		},

		route: route,
		send: sendInternal,
		set: set,

	    loadStatic: function() {
        var assets = path.relative(ss.client.dirs.static,ss.client.dirs.assets);
        var files = glob.sync('**/*',{cwd:ss.client.dirs.static,nodir:true}).filter(function(p) {
          //TODO exclude directories
          return p.indexOf(assets) !== 0;
        });

        files.forEach(function(url) {
          route(url,null,path.join(ss.client.dirs.static, url));
        });
	    },

	    loadAssets: function() {
        var files = glob.sync('**/*',{cwd:ss.client.dirs.assets,nodir:true})
                      .map(assetPathServed)
                      .filter(function(p) { return p; }),
            prefix = 'assets/'; // should this be configurable?

        files.forEach(function(url) {
          route(prefix+url,null,path.join(ss.client.dirs.assets, url));
        });
	    }
    };

    function assetPathServed(filePath) {
      if (/\.index\.html/.test(filePath)) {
        return path.dirname(filePath);
      }
      return filePath; // URL path
    }

    function sendInternal(url,res) {
			if (url.charAt(0) !== '/') { url = '/'+url; }
			var point = getPoint(url);
			// console.log(url,res,'sent');
			if (point) {
				point.handle(res.req, res);
			} else {
				ss.log.error('Couldn\'t serve', url);
			}
    }

    // assumed to be dev time frame, if this is to be used for production it should be enhanced
    function set(url, content, mimeType) {
			if (url.charAt(0) !== '/') { url = '/'+url; }
			var point = getPoint(url) || new KnownPoint(url);
			// console.info('new url:',url, mimeType);
			point.content = content;
			point.mimeType = mimeType;
    }

	function cachedMiddleware(req, res, next) {
		var point = getPoint(req);
		// console.log('cmw',point,req.url);
		if (point) {
			return point.handle(req,res,next);
		}
		next();
	}
};
