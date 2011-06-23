# HTTP Middleware Manager
# -----------------------
# Loads custom and internal middleware

util = require('util')
copy = require('../utils/copy.coffee')

#Load middleware stack for the primary HTTP/HTTPS server
exports.primary = ->
  stack = new Stack
  stack.loadCustom()
  stack.load('https_redirect')         if SS.config.https.enabled
  stack.load('url_parser')             # required by other middleware below
  stack.load('api')                    if SS.config.api.enabled
  stack.load('browser_check')          if SS.config.browser_check.enabled
  stack.load('compile')                if !SS.config.pack_assets
  stack.load('static')                 # always serve static files last
  stack
  
# Load middleware stack for the secondary HTTP server (which serves the API or forwards website requests to HTTPS)
exports.secondary = ->
  stack = new Stack
  stack.load('url_parser')             # required by other middleware below
  stack.load('api')                    if SS.config.api.enabled and !SS.config.api.https_only
  stack.load('http_redirect')          # redirect all non-API requests to HTTPS
  stack
  
# Define the stack
class Stack

  constructor: ->
    @stack = []

  execute: (request, response, i = 0) ->
    @stack[i].call request, response, =>
      @execute(request, response, i + 1)

  # Load custom HTTP config file and any custom middleware first
  loadCustom: ->
    file = "/config/http.coffee"
    try
      custom_http_handler = require("#{SS.root}#{file}")
      @stack.push custom_http_handler
    catch e
      util.log "#{file} file missing! Attempting to copy default template..."
      source = __dirname + '/../../new_project/config/http.coffee'
      destination = "#{SS.root}/config/http.coffee"
      copy.copyFile source, destination
      util.log "#{file} file created!"

  # Load Internal Middleware
  load: (name) ->
    try
      @stack.push processor = require("./#{name}.coffee")
    catch e
      unless processor
        SS.log.error.message "Unable to load internal HTTP middleware: #{name}"
        throw e
