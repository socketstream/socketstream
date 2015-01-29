var path = require('path');
var iswin = process.platform === 'win32';

module.exports = function packagePathAndRemainder (x) {
    var splitRe = iswin ? /[\/\\]/ : /\/+/;
    var parts = x.split(splitRe);
    
    var pivot = parts.lastIndexOf('node_modules');
    if (pivot === -1) return null;
    
    var p = path.join.apply(null, parts.slice(0, pivot + 2));
    return {
        path: iswin ? p : '/' + p,
        remainder: path.join.apply(null, parts.slice(pivot + 2)) || null
    };
};
