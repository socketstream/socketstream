# Client Asset Manager
# --------------------
# The Client Asset Manager allows you to define multiple single-page 'clients' which can be served on
# different URLs or to different devices. Note: The Client Asset Manager deliberately makes extensive use
# of synchronous code. This is because all operations only ever run once on startup (when packing the assets)
# unless you are running in dev mode

log = console.log
systemAssets = require('./system')
templateEngine = require('./template_engine')
formatters = require('./formatters')

# Set defaults
packAssets = false
options = 
  packAssets: {}
  liveReload: ['code', 'css', 'static', 'templates', 'views']
  dirs:
    code:       '/client/code'
    css:        '/client/css'
    static:     '/client/static'
    assets:     '/client/static/assets'
    templates:  '/client/templates'
    views:      '/client/views'
    workers:    '/client/workers'


# Store each client as an object
clients = {}

exports.init = (ss, router) ->

  http = require('./http').init(ss.root, clients, options)
  
  systemAssets.load()

  # Allow third-party modules to send libs to the client by extending the ss API
  ss.client = {send: systemAssets.send}

  # Return API
  formatters:     formatters.init(ss.root)
  templateEngine: templateEngine.init(ss, options)
  assets:         systemAssets
  options:        options
  
  # Merge optional options
  set: (newOption) ->
    throw new Error('ss.client.set() takes an object e.g. {liveReload: false}') unless typeof(newOption) == 'object'
    for k, v of newOption
      if v instanceof Object
        options[k][x] = y for x, y of v
      else
        options[k] = v


  # Tell the asset manager to pack and minimise all assets
  packAssets: (opts) ->
    packAssets = true
    options.packAssets = opts

  # Define a new Single Page Client
  define: (name, paths) ->
    throw new Error("Client name '#{name}' has already been defined") if clients[name]?
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
    systemAssets.send('code', 'init', "require('/entry'); require('socketstream').connect();")
     
    # Bundle initial assets if we're running in production mode
    if packAssets
      pack = require('./pack')
      pack(ss.root, client, options) for name, client of clients
    
    # Else serve files and watch for changes to files in development
    else
      require('./serve/dev')(ss.root, router, options)
      require('./live_reload')(ss.root, options, ss) if options.liveReload

    # Listen out for requests to async load new assets
    require('./serve/ondemand')(ss.root, router, options)

    