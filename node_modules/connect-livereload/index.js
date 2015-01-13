module.exports = function livereload(opt) {
  // options
  var opt = opt || {};
  var ignore = opt.ignore || opt.excludeList || [/\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/,
    /\.woff(\?.*)?$/, /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/
  ];

  var include = opt.include || [/.*/];
  var html = opt.html || _html;
  var rules = opt.rules || [{
    match: /<\/body>(?![\s\S]*<\/body>)/i,
    fn: prepend
  }, {
    match: /<\/html>(?![\s\S]*<\/html>)/i,
    fn: prepend
  }, {
    match: /<\!DOCTYPE.+?>/i,
    fn: append
  }];
  var disableCompression = opt.disableCompression || false;
  var hostname = opt.hostname || 'localhost';
  var port = opt.port || 35729;
  var src = opt.src || "//' + (location.hostname || '" + hostname + "') + ':" + port + "/livereload.js?snipver=1";
  var snippet = "\n<script>//<![CDATA[\ndocument.write('<script src=\"" + src + "\"><\\/script>')\n//]]></script>\n";

  // helper functions
  var regex = (function() {
    var matches = rules.map(function(item) {
      return item.match.source;
    }).join('|');

    return new RegExp(matches, 'i');
  })();

  function prepend(w, s) {
    return s + w;
  }

  function append(w, s) {
    return w + s;
  }

  function _html(str) {
    if (!str) return false;
    return /<[:_-\w\s\!\/\=\"\']+>/i.test(str);
  }

  function exists(body) {
    if (!body) return false;
    return regex.test(body);
  }

  function snip(body) {
    if (!body) return false;
    return (~body.lastIndexOf("/livereload.js"));
  }

  function snap(body) {
    var _body = body;
    rules.some(function(rule) {
      if (rule.match.test(body)) {
        _body = body.replace(rule.match, function(w) {
          return rule.fn(w, snippet);
        });
        return true;
      }
      return false;
    });
    return _body;
  }

  function accept(req) {
    var ha = req.headers["accept"];
    if (!ha) return false;
    return (~ha.indexOf("html"));
  }

  function check(str, arr) {
    if (!str) return true;
    return arr.some(function(item) {
      if ((item.test && item.test(str)) || ~str.indexOf(item)) return true;
      return false;
    });
  }

  // middleware
  return function livereload(req, res, next) {
    if (res._livereload) return next();
    res._livereload = true;

    if (!accept(req) || !check(req.url, include) || check(req.url, ignore)) {
      return next();
    }

    // Disable G-Zip to enable proper inspecting of HTML
    if (disableCompression) {
      req.headers['accept-encoding'] = 'identity';
    }

    var runPatches = true;
    var writeHead = res.writeHead;
    var write = res.write;
    var end = res.end;

    res.push = function(chunk) {
      res.data = (res.data || '') + chunk;
    };

    res.inject = res.write = function(string, encoding) {
      if(!runPatches) return write.call(res, string, encoding);

      if (string !== undefined) {
        var body = string instanceof Buffer ? string.toString(encoding) : string;
        // If this chunk must receive a snip, do so
        if (exists(body) && !snip(res.data)) {
          res.push(snap(body));
          return true;
        }
        // If in doubt, simply buffer the data for later inspection (on `end` function)
        else {
          res.push(body);
          return true;
        }
      }
      return true;
    };

    res.writeHead = function() {
      if(!runPatches) return writeHead.apply(res, arguments);

      var headers = arguments[arguments.length - 1];
      if (typeof headers === 'object') {
        for (var name in headers) {
          if (/content-length/i.test(name)) {
            delete headers[name];
          }
        }
      }

      if (res.getHeader('content-length')) res.removeHeader( 'content-length' );

      writeHead.apply(res, arguments);
    };

    res.end = function(string, encoding) {
      if(!runPatches) return end.call(res, string, encoding);

      // If there are remaining bytes, save them as well
      // Also, some implementations call "end" directly with all data.
      res.inject(string);
      runPatches = false;
      // Check if our body is HTML, and if it does not already have the snippet.
      if (html(res.data) && exists(res.data) && !snip(res.data)) {
        // Include, if necessary, replacing the entire res.data with the included snippet.
        res.data = snap(res.data);
      }
      if (res.data !== undefined && !res._header) res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
      end.call(res, res.data, encoding);
    };

    next();
  };

};
