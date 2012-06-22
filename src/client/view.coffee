# Client Views
# ------------
# Generates HTML output for each single-page view 

pathlib = require('path')
magicPath = require('./magic_path')
wrap = require('./wrap')

module.exports = (ss, client, options, cb) ->

  templateEngine = require('./template_engine')(ss)

  # When packing assets the default path to the CSS or JS file can be overridden 
  # either with a string or a function, typically pointing to an resource on a CDN
  resolveAssetLink = (type) ->
    defaultPath = "/assets/#{client.name}/#{client.id}.#{type}"
    if link = options.packedAssets?.cdn?[type]
      if typeof(link) == 'function'
        file =
          id:         client.id
          name:       client.name
          extension:  type
          path:       defaultPath
        link(file)
      else if typeof(link) == 'string'
        link
      else
        throw new Error("CDN #{type} param must be a Function or String")
    else
      defaultPath

  templates = ->

    dir = pathlib.join(ss.root, options.dirs.templates)
    
    output = []

    if client.paths.tmpl
      files = []
      client.paths.tmpl.forEach (tmpl) ->
        files = files.concat(magicPath.files(dir, tmpl))
      
      templateEngine.generate dir, files, (templateHTML) ->
        output.push(templateHTML)

    output


  headers = ->

    # Return an array of headers. Order is important!
    output = []

    # If assets are packed, we only need one CSS and one JS file
    if options.packedAssets
      
      css = resolveAssetLink('css')
      js  = resolveAssetLink('js')
              
      output.push(wrap.htmlTag.css(css))
      output.push(wrap.htmlTag.js(js))

    # Otherwise, in development, list all files individually so debugging is easier
    else

      # SocketStream system libs and modules
      output.push wrap.htmlTag.js("/_serveDev/system?ts=#{client.id}")

      # Send all CSS
      client.paths.css.forEach (path) ->
        magicPath.files(pathlib.join(ss.root, options.dirs.css), path).forEach (file) ->
          output.push wrap.htmlTag.css("/_serveDev/css/#{file}?ts=#{client.id}")

      # Send Application Code
      client.paths.code.forEach (path) ->
        magicPath.files(pathlib.join(ss.root, options.dirs.code), path).forEach (file) ->
          output.push wrap.htmlTag.js("/_serveDev/code/#{file}?ts=#{client.id}&pathPrefix=#{path}")

      # Start your app and connect to SocketStream
      output.push wrap.htmlTag.js("/_serveDev/start?ts=#{client.id}")

    output


  # Init

  asset = require('./asset')(ss, options)

  # Add links to CSS and JS files
  includes = headers()

  # Add any Client-side Templates
  includes = includes.concat( templates() )

  # Output HTML
  htmlOptions = {headers: includes.join(''), compress: options.packedAssets, filename: client.paths.view}
  asset.html(client.paths.view, htmlOptions, cb)


  


