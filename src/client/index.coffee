# Client Asset Manager
# --------------------
# The Client Asset Manager allows you to define multiple single-page 'clients' which can be served on
# different URLs or to different devices. Note: The Client Asset Manager deliberately makes extensive use
# of synchronous code. This is because all operations only ever run once on startup (when packing the assets)
# unless you are running in dev mode

log = console.log
system = require('./system')
templateEngine = require('./template_engine')
formatters = require('./formatters')

# Set defaults
packAssets = false
settings = 
  packAssets: {}
  liveReload: ['code', 'css', 'static', 'templates', 'views']

# Store each client as an object
clients = {}

exports.init = (root, router, reservedNames) ->

  http = require('./http').init(root, clients)
  
  system.load()

  # Return API
  formatters:     formatters.init(root)
  templateEngine: templateEngine.init(root)
  assets:         system
  
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
    throw new Error("You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array") if typeof(paths.view) != 'string'
    throw new Error("The '#{paths.view}' view must have a valid HTML extension (such as .html or .jade)") if paths.view.indexOf('.') == -1

    # Alias 'templates' to 'tmpl'
    paths.tmpl = paths.templates if paths.templates

    # Force each into an array
    ['css','code','tmpl'].forEach (assetType) =>
      paths[assetType] = [paths[assetType]] unless paths[assetType] instanceof Array

    # Define new client object
    clients[name] = {id: Number(Date.now()), name: name, paths: paths}
  
  # Listen and serve incoming asset requests
  load: (ss) ->
    formatters.load()

    # Code to execute once everything is loaded
    system.add('code', 'init', "require('/entry'); require('socketstream').connect();")
     
    # Bundle initial assets if we're running in production mode
    if packAssets
      pack = require('./pack')
      pack(root, client, settings.packAssets) for name, client of clients
    
    # Else serve files and watch for changes to files in development
    else
      require('./serve/dev')(root, router)
      require('./live_reload')(root, settings.liveReload, ss) if settings.liveReload

    # Listen out for requests to async load new assets
    require('./serve/ondemand')(root, router, packAssets)

    