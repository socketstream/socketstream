# SocketStream Configurator

fs = require('fs')
util = require('util')

exports.configure = ->
  setDefaults()
  setEnvironmentDefaults()
  mergeAppConfigFile()



# Set sensible defaults so we can be up and running without an app-specific config file
setDefaults = ->
  $SS.config =
    port:               3000		    # if you want to run on port 80 or 443 node must be run as root
    enable_color:       true        # use colors when outputting to terminal
    pack_assets:        true      	# set this to false when developing to force the serving of all asset requests live
    throw_errors:       true      	# this needs to be false in production or the server will quit on any error

    # Logger (only to the terminal for now)
    log:
      level:            3         	# 0 = none, 1 = calls only, 2 = calls + params, 3 = full
    
    # SSL (experimental)
    ssl:
      enabled:          false       # https support is currently highly experimental. turned off by default

    # Redis
    redis:
      host: 		'127.0.0.1'
      port: 		6379
      options:		{}
    
    # Configures the HTTP request-based API
    api:
      enabled:          true
      prefix:           'api'     # defines the URL namespace
    
    # Set params which will be passed directly to the client when they connect
    # The client config should match the server as closly as possible
    client:
      remote_prefix:    null      # automatically prefixes all remote calls. e.g. if your server api begins 'v1' remote('app.square') will become remote('v1.app.square')
      log:
        level:          2       	# 0 = none, 1 = calls only, 2 = calls + params, 3 = full

# For now we override default config depending upon environment. This will still be overridden by any app config file in
# /config/environments/NODE_ENV.js . We may want to remove this in the future and insist upon seperate app config files, ala Rails
setEnvironmentDefaults = ->
  override = switch $SS.env
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

# Merges custom app config specificed in /config/environments/NODE_ENV.js with SocketStream defaults if the file exists
mergeAppConfigFile = ->
  try
    config_file_name = "/config/environments/#{$SS.env}.json"
    config_file_body = fs.readFileSync($SS.root + config_file_name, 'utf-8')
    try
      app_config = JSON.parse(config_file_body)
      try
        merge(app_config)
      catch e
        throw ['app_config_unable_to_merge', 'App config file loaded and parsed as JSON but unable to merge. Check syntax carefully.']
    catch e
      throw ['app_config_cannot_parse_json','Loaded, but unable to parse app config file ' + config_file_name + '. Ensure it is in valid JSON format with quotes around all strings.']
  catch e
    if typeof(e) == 'object' and e.length >= 2
      $SS.sys.log.error.exception(e)
      throw 'App config error'

merge = (new_config) ->
  $SS.config = $SS.config.extend(new_config)
