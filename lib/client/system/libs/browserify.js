// Module loading code from Browserify: https://github.com/substack/node-browserify

window.require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved] || require.initModule(resolved);
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    return mod._cached ? mod._cached : mod();
};

require.paths = [];
require.modules = {};

require._core = {
    'events': true, // FUTURE_WORK, support events?
    'path': true,
    'vm': true // FUTURE_WORK, support vm ?
};

require.resolve = function (x, cwd) {
  if (!cwd) { cwd = '/'; }

  if (require._core[x]) {return x;}
  var path = require.modules.path();

  // strip extension
  var ext = path.extname(x);
  if (ext) {
    x = x.substring(0, x.length - ext.length);
  }

  // paths are ../ or ./ or /
  x = x.charAt(0) === '/' ? path.resolve(cwd, x.substring(1)) : x;
  x = x.match(/^(?:\.\.?\/)/) ? path.resolve(cwd,x) : x;

  var resolved = firstMatch(
    x, // as a file
    path.join(x,'index') // as a directory
  );
  if (resolved) {return resolved;}

  throw new Error("Cannot find module '" + x + "' within '"+cwd+"'");

  function firstMatch() {
    for(var i= 0,a; (a = arguments[i]); ++i) {
      if (require.modules[a]) { return a; }
    }
  }
};

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);

    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    })(require.modules);

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    //if (filename.substring(0,3) === '/./') { filename = filename.substring(2); }
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;

    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };

    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }

    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.define("path", function (require, module, exports) {
  // deprecated. Array.filter will be used in the future ES5 shim required for older browsers.
  function filter (xs, fn) {
      var res = [];
      for (var i = 0; i < xs.length; i++) {
          if (fn(xs[i], i, xs)) res.push(xs[i]);
      }
      return res;
  }

  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length; i >= 0; i--) {
      var last = parts[i];
      if (last == '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }

  // Regex to split a filename into [*, dir, basename, ext]
  // posix version
  var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

  // path.resolve([from ...], to)
  // posix version
  exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0)
        ? arguments[i]
        : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string' || !path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // collapse . access
  resolvedPath = resolvedPath.replace(/\/\.\//,'/');

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
      return !!p;
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };

  // path.normalize(path)
  // posix version
  exports.normalize = function(path) {
    var isAbsolute = path.charAt(0) === '/',
        trailingSlash = path.slice(-1) === '/';

    // Normalize the path
    path = normalizeArray(filter(path.split('/'), function(p) {
      return !!p;
    }), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  };


  // posix version
  exports.join = function() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(filter(paths, function(p) {
      return p && typeof p === 'string';
    }).join('/'));
  };


  exports.dirname = function(path) {
    var dir = splitPathRe.exec(path)[1] || '';
    if (!dir) {
      // No dirname
      return '.';
    } else if (dir === '/') {
      // It is just a slash or a drive letter with a slash
      return dir;
    } else {
      // It is a full dirname, strip trailing slash
      return dir.substring(0, dir.length - 1);
    }
  };


  exports.basename = function(path, ext) {
    var f = splitPathRe.exec(path)[2] || '';
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  };


  exports.extname = function(path) {
    return splitPathRe.exec(path)[3] || '';
  };

});
