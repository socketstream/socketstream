'use strict';

/**
 * @ngdoc service
 * @name utils
 * @function
 *
 * @description
 * Contains utils modules for working with file system and some additional helpers
 */

/**
 * @ngdoc service
 * @name utils.file:file
 * @function
 *
 * @description
 * This is used to maintain lists of userIds to socketIds and channelIds to socketIds
 */

var fs = require('fs'),
    path = require('path');

/**
 * Identifies if the path is hidden
 *
 * @param  {String}  path
 * @return {Boolean}
 */
function isHidden(path) {
    return path.match(/(^_|^\.|~$)/);
}

/**
 * Identifies if the path is directory
 *
 * @param  {String}  abspath   Absolute path, should be already have replaced '\' with '/' to support Windows
 * @param  {Object}  found     Object: {dirs: [], files: [] }, contains information about directory's files and subdirectories
 * @return {Object}            Updated 'found' object
 */
function isDir(abspath, found) {
    var stat       = fs.statSync(abspath),
        abspathAry = abspath.split('/'),
        data,
        file_name;

    if (!found) {
        found = {dirs: [], files: [] }
    }

    if (stat.isDirectory() && !isHidden(abspathAry[abspathAry.length - 1])) {
        found.dirs.push(abspath);

        /* If we found a directory, recurse! */
        data        = exports.readDirSync(abspath);
        found.dirs  = found.dirs.concat(data.dirs);
        found.files = found.files.concat(data.files);

    } else {

        abspathAry = abspath.split('/');
        file_name  = abspathAry[abspathAry.length - 1];

        if (!isHidden(file_name)) {
            found.files.push(abspath);
        }
    }
    return found;
}

/**
 * @ngdoc service
 * @name utils.file#readDirSync
 * @methodOf utils.file:file
 * @function
 *
 * @description
 * Reads the contents of a dir. Adapted from https://gist.github.com/825583
 *
 * @param {String} start Directory absolute path to lookup
 */
exports.readDirSync = function(start) {
    var stat,
        found = {dirs: [], files: [] },
        files,
        abspath,
        x, l;

    try {
        /* Use lstat to resolve symlink if we are passed a symlink */
        stat = fs.lstatSync(start)

        /* Read through all the files in this directory */
        if (stat.isDirectory()) {
            files = fs.readdirSync(start).sort();

            for (x = 0, l = files.length; x < l; x++) {
                /* replace '\' with '/' to support Windows */
                abspath = path.join(start, files[x]).replace(/\\/g, '/');

                found = isDir(abspath, found);
            }
        } else {
            throw (new Error('path: ' + start + ' is not a directory'));
        }
        return found;

    } catch (e) {
        /* Ignore if optional dirs are missing */
        if (e.code !== 'ENOENT') {
            throw (e);
        }
        return false;
    }
};

/**
 * @ngdoc service
 * @name utils.file#loadPackageJSON
 * @methodOf utils.file:file
 * @function
 *
 * @description
 * Loads SocketStream's package.json file from the root directory
 *
 * @return {Object|Error} JSON object or thorws an eror if unable to find or parse SocketStream's package.json file
 */
exports.loadPackageJSON = function() {
    try {
        return JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));
    } catch (e) {
        throw ('Error: Unable to find or parse SocketStream\'s package.json file');
    }
};

/**
 * @ngdoc service
 * @name utils.file#isDir
 * @methodOf utils.file:file
 * @function
 *
 * @description
 * In synchronous mode returns if givven `filePath` is directory or not
 *
 * @return {Boolean} TRUE if givven `filePath` is dorectory
 */
exports.isDir = function(filePath) {
    return fs.statSync(filePath).isDirectory();
};

/**
 * @ngdoc service
 * @name utils.file#findExtForBasePath
 * @methodOf utils.file:file
 * @function
 *
 * @description
 * Given a basename, find a matching file with an extension.
 *
 * @example:
 * <pre>
 *   findExtForBase('views/main')       => '.jade'
 *   findExtForBase('css/i-dont-exist') => null
 * </pre>
 *
 * @param {Object} basepath Path to directory
 * @returns {Array|null} Array of files or `null`
 */
exports.findExtForBasePath = function(basepath) {
    var files = fs.readdirSync(path.join(basepath, '..')),
        basename = path.basename(basepath),
        basenameRegex = new RegExp('^' + basename);

    files = files.filter(function(file) {
        return file.match(basenameRegex) && path.extname(file);
    });
    return files.length ? path.extname(files.sort()[0]) : null;
};