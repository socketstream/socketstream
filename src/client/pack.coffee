# Asset Packer
# ------------
# Packs all CSS, JS and HTML assets declared in the ss.client.define() call to be sent upon initial connection
# Other code modules can still be served asynchronously later on

log = console.log
require('colors')

fs = require('fs')
pathlib = require('path')

system = require('./system')
magicPath = require('./magic_path')
view = require('./view')

    
module.exports = (root, client, options) ->

  asset = require('./asset').init(root, options)

  client.pack = true

  containerDir = pathlib.join(root, options.dirs.assets)
  clientDir = pathlib.join(containerDir, client.name)

  packAssetSet = (assetType, paths, dir, postProcess) ->
    
    writeFile = (fileContents) ->
      fileName = clientDir + '/' + client.id + '.' + assetType
      fs.writeFileSync(fileName, postProcess(fileContents))
      log('✓'.green, 'Packed ' + filePaths.length + ' files into ' + fileName.substr(root.length))

    processFiles = (fileContents = [], i = 0) ->
      {path, file} = filePaths[i]
      asset[assetType] file, {pathPrefix: path, compress: true}, (output) ->
        fileContents.push(output)
        if filePaths[++i]
          processFiles(fileContents, i)
        else
          writeFile(fileContents)

    # Expand any dirs into real files
    if paths && paths.length > 0
      filePaths = []
      prefix = pathlib.join(root, dir)
      paths.forEach (path) ->
        magicPath.files(prefix, path).forEach (file) -> filePaths.push({path: path, file: file})
      processFiles()

  
  ### PACKER ###

  log("Pre-packing and minifying the '#{client.name}' client...".yellow)

  # Prepare folder
  mkdir(containerDir)
  mkdir(clientDir)
  deleteOldFiles(clientDir) unless options.packAssets && options.packAssets.keepOldFiles

  # Output CSS
  packAssetSet 'css', client.paths.css, options.dirs.css, (files) ->
    files.join("\n")

  # Output JS
  packAssetSet 'js', client.paths.code, options.dirs.code, (files) ->
    system.serve.js({compress: true}) + files.join(';') + ';' + system.serve.initCode()

  # Output HTML view
  view root, client, options, (html) ->
    fileName = pathlib.join(clientDir, client.id + '.html')
    fs.writeFileSync(fileName, html)
    log('✓'.green, 'Created and cached HTML file ' + fileName.substr(root.length))


# PRIVATE

mkdir = (dir) ->
  fs.mkdirSync(dir) unless pathlib.existsSync(dir)

deleteOldFiles = (clientDir) ->
  numFilesDeleted = 0
  filesDeleted = fs.readdirSync(clientDir).map (fileName) ->
    fs.unlinkSync(pathlib.join(clientDir, fileName))
  filesDeleted.length > 1 && log('✓'.green, "#{filesDeleted.length} previous packaged files deleted")


