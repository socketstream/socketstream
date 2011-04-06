# Configurator
# ------------
# Reads the application config files within /config/environmnets and merges these into the SocketStream defaults

fs = require('fs')
util = require('util')

exports.configure = ->
  setDefaults()
  setEnvironmentDefaults()
  mergeConfigFile("/config/app.json")
  mergeConfigFile("/config/environments/#{$SS.env}.json")


# Set sensible defaults so we can be up and running without an app-specific config file
setDefaults = ->
  $SS.config =
    port:               3000		          # if you want to run on port 80 or 443 node must be run as root
    hostname:           '0.0.0.0'         # allows the server to be bound to a particular IP. listens on all by default
    enable_color:       true              # use colors when outputting to terminal
    pack_assets:        true      	      # set this to false when developing to force the serving of all asset requests live
    throw_errors:       true      	      # this needs to be false in production or the server will quit on any error

    # Logger (only to the terminal for now)
    log:
      level:            3         	      # 0 = none, 1 = calls only, 2 = calls + params, 3 = full
    
    # SSL (experimental)
    ssl:
      enabled:          false             # https support is currently highly experimental. turned off by default

    # Redis
    redis:
      host:             '127.0.0.1'
      port: 		        6379
      options:		      {}
      key_prefix:       'ss'              # all keys created by SocketStream are prefixed with this value
    
    # Configures the HTTP request-based API
    api:
      enabled:          true
      prefix:           'api'           # defines the URL namespace
      auth:
        basic:          
          module_name:  false           # replace this with the name of the authentication module. false = basic auth disabled
          realm:        'Secure API'    # realm name that pops up when you try to access a secure area

    # Set params which will be passed directly to the client when they connect
    # The client config should match the server as closly as possible
    client:
      remote_prefix:    null            # automatically prefixes all remote calls. e.g. if your server api begins 'v1' remote('app.square') will become remote('v1.app.square')
      log:
        level:          2       	      # 0 = none, 1 = calls only, 2 = calls + params, 3 = full
    
    # Users
    users:
      online:
        enabled:        true            # enable tracking of users online in Redis. see $SS.users.online
        mins:           2               # number of mins we wait between confirmations before assuming the user has gone offline
        keep_historic:  false           # do not delete the ss:online:at:<minuteCode> keys we use to work out who's online (can be useful for analytics)
        
    # Realtime Models
    rtm:
      enabled:          false           # disabled by default as HIGHLY EXPERIMENTAL and subject to change


# For now we override default config depending upon environment. This will still be overridden by any app config file in
# /config/environments/SS_ENV.js . We may want to remove this in the future and insist upon seperate app config files, ala Rails
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

# Merges custom app config file with SocketStream defaults if the file exists
mergeConfigFile = (name) ->
  try
    config_file_body = fs.readFileSync($SS.root + name, 'utf-8')
    try
      app_config = JSON.parse(config_file_body)
      try
        merge(app_config)
      catch e
        throw ['app_config_unable_to_merge', "App config file #{name} loaded and parsed as JSON but unable to merge. Check syntax carefully."]
    catch e
      throw ['app_config_cannot_parse_json', "Loaded, but unable to parse app config file #{name}. Ensure it is in valid JSON format with double quotes (not single!) around all strings."]
  catch e
    if typeof(e) == 'object' and e.length >= 2
      $SS.log.error.exception(e)
      throw 'App config error'

merge = (new_config) ->
  $SS.config.extend(new_config)
