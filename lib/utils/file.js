"use strict";

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
 * Reads the contents of a dir. Adapted from https://gist.github.com/825583
 *
 * @param  {String} start [description]
 * @return {[type]}       [description]
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
            throw (new Error("path: " + start + " is not a directory"));
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
 * Loads SocketStream's package.json file from the root directory
 *
 * @return {Object} JSON object
 */
exports.loadPackageJSON = function() {
    try {
        return JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));
    } catch (e) {
        throw ('Error: Unable to find or parse SocketStream\'s package.json file');
    }
};

exports.isDir = function(filePath) {
    return fs.statSync(filePath).isDirectory();
};

/**
 * Given a basename, find a matching file with an extension.
 * Examples:
 *   findExtForBase('views/main')       => '.jade'
 *   findExtForBase('css/i-dont-exist') => null
 *
 * @param  {String} basepath
 * @return {Mixed}
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