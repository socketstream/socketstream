# Current Config
# --------------
# Loads the SocketStream default config and merges any application config files within /config/environmnets into it
# Copyright 2011 - Owen Barnes <owen@socketstream.org> - MIT Licensed

fs = require('fs')
util = require('util')

# Load from defaults
config = require('./default.coffee').config

# Sets the current config to the default then merges in custom values
exports.load = ->
  config.extend environmentDefaults()
  mergeConfigFiles()
  config


# For now we override default config depending upon environment. This will still be overridden by any app config file in
# /config/environments/<SS_ENV>.coffee . We may want to remove this in the future and insist upon seperate app config files, ala Rails
environmentDefaults = ->
  switch SS.env
    when 'development'
      pack_assets: false
    when 'production'
      throw_errors: false
      log:
        level: 0
      client:
        log:
          level: 0

# This will search for the application config file, and merge it if it exists, or raise an error if it does not.
# It will also search for an optional environment-specific file and merge if it exists
mergeConfigFiles = ->
  config_dir_files = fs.readdirSync "#{SS.root}/config/"
  for file in config_dir_files
    path = "/config"
    merge("#{path}/#{file}") if file.match(/^app\.(js|coffee)$/)?
  if config_dir_files.include("environments")
    path = "/config/environments"
    for file in fs.readdirSync "#{SS.root}#{path}"
      merge("#{path}/#{file}") if file.match(SS.env)? and file.match(/.(js|coffee)$/)?

merge = (name) ->
  try
    config.extend(require("#{SS.root}#{name}").config)
  catch e
    SS.log.error.exception(e)
    throw new Error("App config file #{name} loaded and parsed but unable to merge. Check syntax carefully and ensure config values exist.")
