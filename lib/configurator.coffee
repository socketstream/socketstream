# Configurator
# ------------
# Reads the application config files within /config/environmnets and merges these into the SocketStream defaults

fs = require('fs')
util = require('util')

exports.configure = ->
  setDefaults()
  setEnvironmentDefaults()
  mergeConfigFiles()

# Set sensible defaults so we can be up and running without an app-specific config file
setDefaults = ->
  SS.config =
    loaded:                   true            # allows us to check the app's config has been loaded
    ss_var:                   'SS'            # the main SocketStream global variable server-side
    enable_color:             true            # use colors when outputting to terminal
    pack_assets:              true	          # set this to false when developing to force the serving of all asset requests live
    throw_errors:             true            # this needs to be false in production or the server will quit on any error

    # HTTP
    http:
      port:                   3000		        # if you want to run on port 80 or 443 node must be run as root
      hostname:               '0.0.0.0'       # allows the server to be bound to a particular IP. listens on all by default
    
    # HTTPS / SSL / TLS
    https:
      enabled:                false           # see readme for full details
      port:                   443		          # if you want to run on port 80 or 443 node must be run as root
      hostname:               '0.0.0.0'       # allows the server to be bound to a particular IP. listens on all by default
      cert_name:              'site'          # allows you to use a different certificate name in different environments
      domain:                 false           # enter the full host name here as it appears on your SSL cert: (e.g. www.test.com)
      ensure_domain:          true            # if set, will auto-redirect traffic sent to different hosts to the domain specified above
      redirect_http:          true            # automatically redirects requests to http:// to https://#{host}  Host must be set

    # Logger (only to the terminal for now)
    log:
      level:                  3         	    # 0 = none, 1 = calls only, 2 = calls + params, 3 = full, 4 = everything

    # Redis
    redis:
      host:                   '127.0.0.1'
      port: 		              6379
      options:		            {}
      db_index:               0               # select your databases/keyspace from 0 - 15 (the max redis supports by default)
      key_prefix:             'ss'            # all keys created by SocketStream are prefixed with this value
    
    # Configures the HTTP request-based API
    api:
      enabled:                true
      prefix:                 'api'           # defines the URL namespace
      https_only:             false           # only allow API requests over HTTPS
      auth:
        basic:          
          module_name:        false           # replace this with the name of the authentication module. false = basic auth disabled
          realm:              'Secure API'    # realm name that pops up when you try to access a secure area
    
    # Incompatible Browser Checking
    browser_check:
      enabled:                true            
      strict:                 false           # when enabled will serve a static page from /static/incompatible_browsers when non websocket browsers connect

    # Set params which will be passed directly to the client when they connect
    # The client config should match the server as closly as possible
    client:
      remote_prefix:          null            # automatically prefixes all remote calls. e.g. if your server api begins 'v1' remote('app.square') will become remote('v1.app.square')
      heartbeat_interval:     30              # interval in seconds between heartbeats sent to the server to confirm user is online. a lower value increases server and bandwith use. ignored if SS.config.users.online.enabled is false
      log:
        level:                2       	      # 0 = none, 1 = calls only, 2 = calls + params, 3 = full
    
    # Users
    users:
      online:
        enabled:              true            # enable tracking of users online in Redis. see README for more details
        mins_until_offline:   2               # number of mins we wait from receiving the last heartbeat before assuming the user has gone offline
        update_interval:      60              # interval in seconds between the User Online update process runs. this purges users no longer online
        keep_historic:        false           # do not delete the ss:online:at:<minuteCode> keys we use to work out who's online (can be useful for analytics)
    
    # Limiter
    limiter:
      enabled:                false           # enables basic rate limiting (off by default for now)
      websockets:
        rps:                  15              # requests per second which can be executed per-client before requests are dropped
    
    # Realtime Models
    rtm:
      enabled:                false           # disabled by default as HIGHLY EXPERIMENTAL and subject to change

# For now we override default config depending upon environment. This will still be overridden by any app config file in
# /config/environments/<SS_ENV>.coffee . We may want to remove this in the future and insist upon seperate app config files, ala Rails
setEnvironmentDefaults = ->
  override = switch SS.env
    when 'development'
      pack_assets: false
    when 'production'
      throw_errors: false
      log:
        level: 0
      client:
        log:
          level: 0
  merge(override)

# This will search for the application config file, and merge it if it exists, or raise an error if it does not.
# It will also search for an optional environment-specific file and merge if it exists
mergeConfigFiles = ->
  config_dir_files = fs.readdirSync "#{SS.root}/config/" 
  for file in config_dir_files
    path = "/config"
    mergeConfigFile("#{path}/#{file}") if file.match(/^app\.(js|coffee)/)?
  if config_dir_files.indexOf("environments") isnt -1
    path = "/config/environments"
    for file in fs.readdirSync "#{SS.root}#{path}"
      mergeConfigFile("#{path}/#{file}") if file.match(SS.env)?

mergeConfigFile = (name) ->
  mergeJsonFile(name) if name.match(/.json$/)?
  merge(require("#{SS.root}#{name}").config) if name.match(/.(js|coffee)$/)?

merge = (new_config) ->
  try 
    SS.config.extend(new_config)
  catch e
    SS.log.error.exception(e)
    throw new Error("App config file #{name} loaded and parsed but unable to merge. Check syntax carefully and ensure config values exist.")

mergeJsonFile = (name) ->
  util.log SS.log.color("WARNING: JSON-based config files have been deprecated in 0.1.3 and will be removed in a future release. Please convert #{name} to CoffeeScript or JavaScript (generate a new project to see an example).", 'red')
  try
    config_file_body = fs.readFileSync(SS.root + name, 'utf-8')
    try
      app_config = JSON.parse(config_file_body)
      merge(app_config)
    catch e
      throw new Error("Loaded, but unable to parse app config file #{name}. Ensure it is in valid JSON format with double quotes (not single!) around all strings.")
  catch e
    unless e.code == 'EBADF' # Do not warn if config file is not present - that's ok
      SS.log.error.exception(e)
      throw new Error('App config error')
