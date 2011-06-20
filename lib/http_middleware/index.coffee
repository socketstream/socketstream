# HTTP Middleware Manager
# -----------------------
# Loads custom and internal middleware

util = require('util')
copy = require('../utils/copy.coffee')

# Define the stack
stack = []

# Load HTTP middleware stack
exports.init = ->
  loadCustom()
  load('url_parser')             # must run first - required by other modules
  load('api')                    if SS.config.api.enabled
  load('browser_check')          if SS.config.browser_check.enabled
  load('compile')                if !SS.config.pack_assets
  load('static')                 # always serve static files last

# Manage callback hell
exports.execute = (request, response, i = 0) ->
  stack[i].call request, response, ->
    exports.execute(request, response, i + 1)


# PRIVATE METHODS

# Load custom HTTP config file and any custom middleware first
loadCustom = ->
  file = "/config/http.coffee"
  try
    custom_http_handler = require("#{SS.root}#{file}")
    stack.push custom_http_handler
  catch e
    util.log "#{file} file missing! Attempting to copy default template..."
    source = __dirname + '/../../new_project/config/http.coffee'
    destination = "#{SS.root}/config/http.coffee"
    copy.copyFile source, destination
    util.log "#{file} file created!"

# Load Internal Middleware
load = (name) ->
  try
    stack.push processor = require("./#{name}.coffee")
  catch e
    unless processor
      SS.log.error.message "Unable to load internal HTTP middleware: #{name}"
      throw e