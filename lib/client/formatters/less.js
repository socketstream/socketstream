'use strict';

var fs = require('fs'),
    pathlib = require('path'),
    _prependedLess;

exports.prependLess = function(prependedLess) {
    if(typeof prependedLess === 'string') {
        _prependedLess = prependedLess;
    }
};

function errorBodyStyling(root,path, err) {
    path = path.replace(root,'');
    var filename = err.filename.replace(root,'');
    var r = [
        'body:before {',
        'display:block;',
        'position:absolute;',
        'top:15px; left:20px; right:20px;',
        'z-index: 10000;',
        'content:"Error compiling LESS file: '+path+' at '+(filename||'?')+' '+(err.line||'?')+':'+(err.index||'?')+'   '+err.message+'";',
        'border: 1px solid #888;',
        'border-radius: 5px;',
        'background-color: rgba(255,255,255,.5);',
        'background-color: white;',
        'padding: 10px 15px;',
        '}'
    ];
    return r.join('\n');
}

exports.decidePaths = function decidePaths(path, options) {

    var p = [ pathlib.dirname(path) ];
    //TODO by default we should add the ss.root to paths at end
    if (options.paths) {
        p = p.concat(options.paths);
    }
    return p;
};

// root and config are passed as arguments, but are not used
//
module.exports = function (ss,config) {

    var less = ss.require('less');

    return {

        name: 'Less',
        extensions: ['less'],
        assetType: 'css',
        contentType: 'text/css',

        compile: function(path, options, cb) {

            var input = fs.readFileSync(path, 'utf8');

            if(_prependedLess) {
                input = _prependedLess + '\n' + input;
            }
            var opts = {};
            for(var n in config) { opts[n] = config[n]; }
            opts.filename = path;
            opts.paths = exports.decidePaths(path, config);
            opts.compress = options.compress;

            less.logger.addListener({
                //TODO passing along log output
                debug: function(/*msg*/) {

                },
                info: function(/*msg*/) {

                },
                warn: function(/*msg*/) {

                },
                error: function(/*msg*/) {

                }
            });
            
            //TODO it seems less still blows up on some path errors, is there a way to catch them?

            less.render(input, opts, function(err, out) {
                if (err) {
                    console.log('! - Unable to compile Less file %s into CSS', path);
                    console.log(err);
                    return cb(errorBodyStyling(ss, path, err));
                }
                //TODO out.map
                cb(out.css);
            });
        }
    };
};