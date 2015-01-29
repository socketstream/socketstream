/*!
 * rmdir
 * Copyright(c) 2012 Ben Lin <ben@dreamerslab.com>
 * MIT Licensed
 *
 * @fileoverview
 * Remove all files in the given path recursively.
 */
var fs   = require( 'fs' );
var Flow = require( 'node.flow' );

function rmdir( dir, callback ){
  fs.lstat( dir, function ( err, stat ){
    var is_dir = stat && stat.isDirectory();
    var _dir   = is_dir ? dir + '/' : dir;
    var _files = [];
    var _dirs  = [];

    if( err ) return callback( err, _dirs, _files );

    if( !is_dir ){
      return fs.unlink( _dir, function ( err ){
        return err
          ? callback( err, _dirs, _files )
          : callback( null, _dirs, _files );
      });
    }

    fs.readdir( _dir, function ( err, files ){
      var pending;

      if( err ) return callback( err );

      pending = files.length;

      _dirs.push( _dir );

      if( !pending ){
        return fs.rmdir( _dir, function ( err ){
          return err
            ? callback( err, _dirs, _files )
            : callback( null, _dirs, _files );
        });
      }

      files.forEach( function ( file ){
        file = _dir + file;

        fs.lstat( file, function ( err, stat ){
          function rm_all_dirs( callback ){
            var flow = new Flow();

            if( !--pending ){
              if( !_dirs.length ) return callback();

              _dirs.forEach( function ( dir ){
                flow.parallel( function ( ready ){
                  fs.exists( dir, function ( exists ){
                    if( !exists ) return ready();

                    fs.rmdir( dir, function ( err ){
                      if( err ) return ready( err );

                      ready();
                    });
                  });
                });
              });

              flow.join().
                error( function ( err ){
                  if( err ) callback( err, _dirs, _files );
                }).
                end( function (){
                  callback( null, _dirs, _files );
                });
            }
          }

          if( stat && stat.isDirectory()){
            _dirs.push( file );

            rmdir( file, function ( err, dirs, files ){
              _files = _files.concat( files );

              rm_all_dirs( callback );
            });

            return;
          }

          _files.push( file );
          fs.unlink( file, function ( err ){
            if( err ) return callback( err );

            rm_all_dirs( callback );
          });
        });
      });
    });
  });
};

/**
 * @public
 */
rmdir.version = JSON.parse(
  fs.readFileSync( __dirname + '/../package.json', 'utf8' )
).version;

/**
 * Exports module.
 */
module.exports = rmdir;
