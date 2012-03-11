# Client Asset Manager
# --------------------
# The Client Asset Manager allows you to define multiple single-page 'clients' which can be served on
# different URLs or to different devices. Note: The Client Asset Manager deliberately makes extensive use
# of synchronous code. This is because all operations only ever run once on startup (when packing the assets)
# unless you are running in dev mode

log = console.log
http = require('http')

# Get hold of the 'response' object so we can extend it later
res = http.ServerResponse.prototype

# Keep a list of all loaded code formatters by file extension
formattersByExtension = null

# Set defaults
packAssets = false
settings = 
  packAssets: {}
  liveReload: true

# Code to execute once everything is loaded
initAppCode = "require('/entry'); require('socketstream').connect();"

exports.init = (root, router, reservedNames) ->

  formatters = require('./formatters').init(root)
  templateEngine = require('./template_engine').init(root)
  Client = require('./client').init(root, templateEngine, initAppCode)
  
  clients = {}
  ssClient = null

  # Append the 'serveClient' method to the HTTP Response object
  res.serveClient = (nameOrClient) ->
    client = typeof(nameOrClient) == 'string' && clients[nameOrClient] || nameOrClient
    throw new Error('Unable to find single-page client: ' + nameOrClient) unless client?
    client.htmlFromCache ssClient, formattersByExtension, packAssets, (output) =>
      @writeHead(200, {
        'Content-Length': Buffer.byteLength(output),
        'Content-Type': 'text/html'
      })
      @end(output)

  # Alias res.serveClient to keep compatibility with existing apps
  res.serve = res.serveClient

  # Return API
  formatters: formatters
  templateEngine: templateEngine
  
  # Merge optional settings
  set: (newSettings) ->
    throw new Error('ss.client.set() takes an object e.g. {liveReload: false}') unless typeof(newSettings) == 'object'
    settings[k] = v for k, v of newSettings

  # Tell the asset manager to pack and minimise all assets
  packAssets: (options) ->
    packAssets = true
    settings.packAssets = options

  # Define a new Single Page Client
  define: (name, paths) ->
    throw new Error("Client name '#{name}' has already been defined") if clients[name]?
    throw new Error("Client name '#{name}' conflicts with a directory or file name in /client/static") if reservedNames.indexOf(name) == 0
    client = new Client(name, paths, packAssets)
    clients[name] = client
    client
  
  # Temporary - REMOVE_BEFORE_0.3.0
  wrapCode: (nameOrModule, dirs) ->
    throw new Error("Thanks for upgrading to the latest alpha. The ss.client.wrapCode() command has now been deprecated as every file not in /client/code/libs is now assumed to be a module. Please remove calls to ss.client.wrapCode() in your app and restart SocketStream\n\n")

  # Listen and serve incoming asset requests
  load: (client, ss) ->
    ssClient = client
    formattersByExtension = formatters.load()
     
    # Bundle initial assets if we're running in production mode
    if packAssets
      client.pack(ssClient, formattersByExtension, settings.packAssets) for name, client of clients
    
    # Else watch for changes to files in development
    else
      require('./live_reload').init(root, ss) if settings.liveReload

    # Listen out for requests to async load new assets and/or serve all assets live in dev mode 
    asset = require('./asset').init(root, formattersByExtension)
    require('./serve_live').init(router, ssClient, asset, initAppCode, packAssets)
