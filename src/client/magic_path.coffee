# Magic Path
# ----------
# Allows paths to be supplied as specific files (with file extensions) or as directories
# (in which case the contents of the dir will be expanded and served in alphanumeric order)

require('colors')
fileUtils = require('../utils/file')

exports.files = (prefix, paths = ['*']) ->
  files = []
  prefix = prefix.replace(/\\/g, '/') # replace '\' with '/' to support Windows
  numRootFolders = prefix.split('/').length
  paths = [paths] unless paths instanceof Array
  paths.forEach (path) ->
    sp = path.split('/')
    if sp[sp.length-1].indexOf('.') > 0
      files.push(path)
    else
      dir = prefix
      dir += ('/' + path) unless path == '*'
      if tree = fileUtils.readDirSync(dir)
        tree.files.sort().forEach (file) ->
          files.push(file.split('/').slice(numRootFolders).join('/'))
      else
        console.log("! Error: #{dir} directory not found".red)
  files
