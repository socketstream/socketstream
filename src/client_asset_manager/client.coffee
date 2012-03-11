# Single-page Client
# ------------------
# Allows you to define which assets should be served for each client
# TODO: Cleanup this code. It's way too messy for my liking

log = console.log
fs = require('fs')
pathlib = require('path')
magicPath = require('./magic_path')

exports.init = (root, templateEngine, initAppCode) ->

  containerDir = pathlib.join(root, 'client/static/assets')
  templateDir = 'client/templates'

  class Client

    constructor: (@name, @paths) ->
      @id = Number(Date.now())
      @name = name

    # Generate JS/CSS Script/Link tags for inclusion in the client's HTML
    headers: (packAssets = false) ->

      ts = @id
      headers = []

      if packAssets
        headers.push tag.css("/assets/#{@name}/#{@id}.css")
        headers.push tag.js("/assets/#{@name}/#{@id}.js")
      else
        @paths.css?.forEach (path) ->
          magicPath.files(root + '/client/css', path).forEach (file) ->
            headers.push tag.css("/_serveDev/css/#{file}?ts=#{ts}")

        # SocketStream Browser Client (including system modules)
        headers.push tag.js("/_serveDev/client?ts=#{ts}")

        # Send Application Code
        @paths.code?.forEach (path) ->
          magicPath.files(root + '/client/code', path).forEach (file) ->
            headers.push tag.js("/_serveDev/code/#{file}?ts=#{ts}&pathPrefix=#{path}")

        # Start your app and connect to SocketStream
        headers.push tag.js("/_serveDev/start?ts=#{ts}")

      # Output list of headers
      headers

    # Attempts to serve a cached copy of the HTML for this client if it exists, or generates it live if not
    htmlFromCache: (ssClient, formatters, packAssets, cb) ->
      if packAssets
        fileName = pathlib.join(containerDir, @name, @id + '.html')
        fs.readFile fileName, 'utf8', (err, output) ->
          cb output
      else
        @html(ssClient, formatters, false, cb)

    # Generate contents of the main HTML view
    html: (ssClient, formatters, packAssets, cb) ->
      includes = []
      paths = @paths

      outputView = ->
        view = paths.view
        sp = view.split('.')
        extension = sp[sp.length-1]
        path = pathlib.join(root, 'client/views', view)

        formatter = formatters[extension]
        throw new Error("Unable to output view. Unsupported file extension #{extension}. Please provide a suitable formatter") unless formatter
        throw new Error("Unable to render view. #{formatter.name} is not a HTML formatter") unless formatter.assetType == 'html'

        formatter.compile(path, {headers: includes.join(''), filename: path}, cb)
      
      if ssClient.html?
        
        ssClient.html (codeForView) =>

          includes.push(codeForView)

          # Add links to CSS and JS files
          includes = includes.concat(@headers(packAssets))

          # Add any Client-side Templates
          paths.tmpl != false && files = magicPath.files(pathlib.join(root, templateDir))
          if files && files.length > 0
            templateEngine.generate root, templateDir, files, formatters, (templateHTML) ->
              includes.push templateHTML
              outputView()
          else
            outputView()

  
    # Pack all assets declared in the ss.client.define() call to be sent upon initial connection
    # Other code modules can still be served asynchronously later on
    pack: (ssClient, formatters, options) ->

      asset = require('./asset').init(root, formatters)

      packAssetSet = (assetType, paths, dir, concatinator, initialCode = '', endCode = '') ->

        processFiles = (fileContents = [], i = 0) ->
          {path, file} = filePaths[i]

          asset[assetType] file, {pathPrefix: path, compress: true}, (output) ->
            fileContents.push(output)

            if filePaths[i+1]
              processFiles(fileContents, i+1)
            else
              # This is the final file - output contents
              output = fileContents.join(concatinator)
              output = initialCode + output + endCode
              fileName = clientDir + '/' + id + '.' + assetType

              fs.writeFileSync(fileName, output)
              log('✓'.green, 'Packed ' + filePaths.length + ' files into ' + fileName.substr(root.length))

        # Expand any dirs into real files
        if paths && paths.length > 0
          filePaths = []
          prefix = pathlib.join(root, dir)
          paths.forEach (path) ->
            magicPath.files(prefix, path).forEach (file) -> filePaths.push({path: path, file: file})
          processFiles()

      # Pack Assets
      id = @id
      clientDir = pathlib.join(containerDir, @name)

      log("Pre-packing and minifying the '#{@name}' client...".yellow)

      # Create directory for this client
      fs.mkdirSync(containerDir) unless pathlib.existsSync(containerDir)
      fs.mkdirSync(clientDir) unless pathlib.existsSync(clientDir)

      # Delete any old packed asset files
      unless options && options.keepOldFiles
        numFilesDeleted = 0
        filesDeleted = fs.readdirSync(clientDir).map (fileName) ->
          fs.unlinkSync(pathlib.join(clientDir, fileName))
        filesDeleted.length > 1 && log('✓'.green, "#{filesDeleted.length} previous packaged files deleted")
   
      # Output CSS
      packAssetSet('css', @paths.css, 'client/css', "\n")

      # Output JS
      ssClient.code (clientCode) =>
        packAssetSet('js', @paths.code, 'client/code', "; ", clientCode, '; ' + initAppCode)

      # Output HTML view
      @html ssClient, formatters, true, (output) ->
        fileName = pathlib.join(clientDir, id + '.html')
        fs.writeFileSync(fileName, output)
        log('✓'.green, 'Created and cached HTML file ' + fileName.substr(root.length))



# Private

# Helpers to generate HTML tags
tag =

  css: (path) ->
    '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css">'

  js: (path) ->
    '<script src="' + path + '" type="text/javascript"></script>'




