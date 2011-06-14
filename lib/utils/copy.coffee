# Based on recursive copy functions from https://github.com/brunch/brunch/blob/master/src/helpers.coffee
# Many thanks to Allan Berger, Jan Monschke, Martin Schürrer, Thomas Schranz, Nik Graf

fs = require 'fs'
path = require 'path'
util = require 'util'

# copy single file and executes callback when done
exports.copyFile = (source, destination) ->
  read = fs.createReadStream(source)
  write = fs.createWriteStream(destination)
  util.pump read, write

# walk through tree, creates directories and copy files
exports.recursiveCopy = (source, destination) ->
  files = fs.readdirSync source

  # iterates over current directory
  files.forEach (file) ->
    unless file.match /^\./

      sourcePath = path.join source, file
      destinationPath = path.join destination, file

      stats = fs.statSync sourcePath
      if stats.isDirectory()
        fs.mkdirSync destinationPath, 0755
        exports.recursiveCopy sourcePath, destinationPath
      else
        exports.copyFile sourcePath, destinationPath

