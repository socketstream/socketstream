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
packAssets = false        # Serve assets live
codeWrappers =            # JS code wrapping (highly experimental!)
  'libs': false
  'modules': 'module'


exports.init = (root, router) ->
  formatters = require('./formatters').init(root)
  Client = require('./client').init(root, codeWrappers)
  
  clients = {}
  ssClient = null

  # Append the 'serve' method to the HTTP Response object
  res.serve = (nameOrClient) ->
    client = typeof(nameOrClient) == 'string' && clients[nameOrClient] || nameOrClient
    throw new Error('Unable to find single-page client: ' + nameOrClient) unless client?
    client.htmlFromCache ssClient, formattersByExtension, packAssets, (output) =>
      @writeHead(200, {'Content-Type': 'text/html'})
      @end(output)

  # Return API
  formatters: formatters

  # Tell the asset manager to pack and minimise all assets
  packAssets: (options) ->
    packAssets = true
    # TODO: Make config option to delete old asset files

  # Define a new Single Page Client
  define: (name, paths) ->
    throw new Error("Client name '#{name}' has already been defined") if clients[name]?
    client = new Client(name, paths, packAssets)
    clients[name] = client
    client
  
  # Wrap client code in safety or module wrappers. By default:
  # /libs has no wraper
  # /modules has the module wrapper
  # everything else has a safty wrapper
  wrapCode: (nameOrModule, dirs) ->
    dirs = [dirs] unless dirs instanceof Array
    dirs.forEach (dir) ->
      codeWrappers[dir] = nameOrModule

  # Listen and serve incoming asset requests
  load: (client) ->
    ssClient = client
    formattersByExtension = formatters.load()
    if packAssets
      client.pack(ssClient, formattersByExtension) for name, client of clients
    else
      asset = require('./asset').init(root, formattersByExtension, codeWrappers)
      require('./serve_live').init(router, ssClient, asset)


