# Based on recursive copy functions from https://github.com/brunch/brunch/blob/master/src/helpers.coffee
# Many thanks to Allan Berger, Jan Monschke, Martin Schürrer, Thomas Schranz, Nik Graf

fs = require('fs')
path = require('path')
util = require('util')


# walk through tree, creates directories and copy files
exports.recursiveCopy = (source, destination, options = {}) ->
  originalSourceLength = source.length

  copyDir = (source, destination, options) ->
    files = fs.readdirSync(source)
    files.forEach (file) ->

      sourcePath = path.join(source, file)
      destinationPath = path.join(destination, file)

      stats = fs.statSync(sourcePath)
      if stats.isDirectory()
        fs.mkdirSync(destinationPath, 0755)
        copyDir(sourcePath, destinationPath, options)
      else
        thisPath = path.dirname(sourcePath).substr(originalSourceLength) || '/'
        extension = path.extname(sourcePath)
        if !options.exclude or (thisPath not in options.exclude.inPaths) or (extension not in options.exclude.extensions)
          copyFile(sourcePath, destinationPath)
  
  copyDir(source, destination, options)


# Private

copyFile = (source, destination) ->
  read = fs.createReadStream(source)
  write = fs.createWriteStream(destination)
  util.pump(read, write)
