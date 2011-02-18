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
    port:               3000		# if you want to run on port 80 or 443 node must be run as root
    log_level:          3         	# 0 = none, 1 = calls only, 2 = calls + params, 3 = full
    pack_assets:        true      	# set this to false when developing
    throw_errors:       true      	# this needs to be false in production or the server will quit on any error
    api_prefix:         'api'     	# defines the HTTP API namespace

    # Redis
    redis:
      host: 		'127.0.0.1'
      port: 		6379
      options:		{}

    # Set Params which will be passed to the client when they connect
    client:
      log_level:        2         	# 0 = none, 1 = calls only, 2 = calls + params, 3 = full

# For now we override default config depending upon environment. This will still be overridden by any app config file in
# /config/environments/NODE_ENV.js . We may want to remove this in the future and insist upon seperate app config files, ala Rails
setEnvironmentDefaults = ->
  override = switch $SS.env
    when 'development'
      pack_assets: false
    when 'production'
      throw_errors: false
      log_level: 0
      client:
        log_level: 0
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
        console.error('App config file loaded and parsed as JSON but unable to merge. Check syntax carefully.')
    catch e
      console.error('Loaded, but unable to parse app config file ' + config_file_name + '. Ensure it is in valid JSON format with quotes around all strings.')
  catch e

merge = (new_config) ->
  $SS.config = Object.extend($SS.config, new_config)
