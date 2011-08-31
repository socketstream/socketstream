# HTTP Middleware Manager
# -----------------------
# Loads custom and internal middleware

util = require('util')
connect = require('connect')
copy = require('../../utils/copy.coffee')

#Load middleware stack for the primary HTTP/HTTPS server
exports.primary = (ssl_options = null) ->
  s = new Stack

  # Load any custom middleware specified in /config/http.coffee
  s.loadCustom 'primary'

  # Load our own middleware for SocketStream
  s.load 'https_redirect'     if SS.config.https.enabled
  s.load 'parse_url'          # required by other middleware below
  s.load 'api'                if SS.config.api.enabled
  s.load 'browser_check'      if SS.config.browser_check.enabled
  s.load 'compile'            if !SS.config.pack_assets
  
  # Always fall back on serving static files using connect.static
  s.stack.push connect.static(SS.root + '/public')

  # Return server
  s.server(ssl_options)
  
# Load middleware stack for the secondary HTTP server (which serves the API or forwards website requests to HTTPS)
exports.secondary = ->
  s = new Stack

  # Load any custom middleware specified in /config/http.coffee
  s.loadCustom 'secondary'
  
  # Load our own middleware for SocketStream
  s.load 'http_redirect'      if SS.config.https.domain and SS.config.https.redirect_http
  s.load 'parse_url'          # required by other middleware below
  s.load 'api'                if SS.config.api.enabled and !SS.config.api.https_only
  
  # Return server
  s.server()
  
# Define the stack
class Stack

  constructor: ->
    @stack = []

  # Returns a new HTTP Server using Connect
  server: (ssl_options) ->
    @stack.unshift(ssl_options) if ssl_options
    connect.apply connect, @stack

  # Load custom HTTP config file and any custom middleware first
  loadCustom: (server_name) ->
    file = "/config/http.coffee"

    # Look for custom middleware. If it doesn't exist automatically use the default file
    try
      custom = require("#{SS.root}#{file}")
    catch e
      if e.message.match(/^Cannot find module/)
        custom = require(__dirname + "/../../../new_project#{file}")
      else
        throw e

    if custom[server_name]
      @stack = @stack.concat(custom[server_name])
    else
      SS.log.error.message "#{file} is out of date - any custom middleware will be ignored. Please delete this file if you don't need it, or upgrade #{file} to the new Connect format introduced in 0.2.0"
      

  # Load Internal Middleware
  load: (name) ->
    try
      @stack.push require("./#{name}.coffee")()
    catch e
      SS.log.error.message "Unable to load internal HTTP middleware: #{name}"
      throw e
  
