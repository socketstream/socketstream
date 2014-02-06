module.exports = (function() {
      var l = function() {
          var args = [].slice.call(arguments);
          args.unshift("FIXME");
          l.info.apply(this, args);
      };
      l.debug = function(){};
      l.info = function(){};
      l.warn = console.log;
      l.error = console.error;
      return l;
  }())
