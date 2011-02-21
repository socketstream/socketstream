# Logger
# ------
# Outputs to the console

util = require("util")

exports.staticFile = (request) ->
  output 1, "STATIC: #{request.url}"

exports.createNewSession = (session) ->
  output 1, color("Creating new session: #{session.id}", 'magenta')

exports.incoming =
    
  socketio: (data, client) ->
    output 2, "#{client.sessionId} #{color('->', 'cyan')} #{data.method}#{parseParams(data.params)}"
      
  http: (actions, params, format) ->
    output 2, "API (#{format}) #{color('->', 'cyan')} #{actions.join('.')} #{parseParams(params)}"

exports.outgoing =
    
  socketio: (client, method) ->
    output 2, "#{client.sessionId} #{color('<-', 'green')} #{method.callee}"
  
exports.publish =
    
  broadcast: (event, params) ->
    output 2, "Broadcast #{color('=>', 'cyan')} #{event}#{parseParams(params)}"

  user: (user_id, event, params) ->
    output 2, "User #{user_id} #{color('=>', 'cyan')} #{event}#{parseParams(params)}"
  
exports.error =

  message: (message) ->
    console.log 'here'
    output 1, color("Error: #{message}", 'red')
  
  exception: (e) ->
    output 1, color("Error: #{e[1]}", 'red')


# Helpers

output = (level, msg) ->
  util.log(msg) if validLevel(level)

validLevel = (level) ->
  $SS.config.log.level >= level

parseParams = (params) ->
  params = util.inspect(params) if params and validLevel(3)
  if params then ': ' + params else ''

color = (msg, color) ->
  return msg unless $SS.config.enable_color
  "\x1B[1;#{color_codes[color]}m#{msg}\x1b[0m"


# List of UNIX terminal colors

color_codes =
  red:        31
  magenta:    35
  cyan:       36
  green:      32
