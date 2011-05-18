# Logger
# ------
# Outputs to the console

util = require("util")

exports.serve =

  staticFile: (request) ->
    output 1, "STATIC: #{request.url}"

exports.incoming =
    
  socketio: (msg, client) ->
    if !(msg.options && msg.options.silent)
      output 2, "#{client.sessionId} #{exports.color('->', 'cyan')} #{msg.method}#{parseParams(msg.params)}"
      
  event: (type, message) ->
    output 2, "#{type} #{exports.color('=>', 'cyan')} #{message.event}#{parseParams(message.params)}"

  rtm: (data, client) ->
    output 2, "#{client.sessionId} #{exports.color('~>', 'cyan')} #{data.rtm}.#{data.action}#{parseParams(data.params)}"

  api: (actions, params, format) ->
    output 2, "API (#{format}) #{exports.color('->', 'cyan')} #{actions.join('.')} #{parseParams(params)}"

  rest: (actions, params, format, http_method) ->
    output 2, "REST #{http_method} (#{format}) #{exports.color('->', 'cyan')} #{actions.join('.')} #{parseParams(params)}"

exports.outgoing =

  socketio: (msg, client) ->
    if !(msg.options && msg.options.silent)
      output 2, "#{client.sessionId} #{exports.color('<-', 'green')} #{msg.method}"
  
  event: (type, event, params) ->
    output 2, "#{type} #{exports.color('<=', 'green')} #{event}#{parseParams(params)}"
      
exports.users =

  online:
    
    update:
      
      start: ->
        output 4, "INFO: Updating list of Users Online..."
        
      complete: ->
        output 4, "INFO: List of Users Online updated"  

exports.error =

  message: (message) ->
    output 1, exports.color("Error: #{message}", 'red')
  
  exception: (e) ->
    output 1, exports.color(e.toString(), 'red')


exports.pubsub =

  channels:
  
    subscribe: (user_id, channel) ->
      output 4, "User ID #{user_id} has subscribed to channel '#{channel}'"
    
    unsubscribe: (user_id, channel) ->
      output 4, "User ID #{user_id} has unsubscribed from channel '#{channel}'"


# Color helper
exports.color = (msg, color) ->
  return msg unless SS.config.enable_color
  msg_ary = msg.split('\n')
  first_line = msg_ary[0]
  other_lines = if msg_ary.length > 1 then '\n' + msg_ary.splice(1).join('\n') else ''
  "\x1B[1;#{color_codes[color]}m#{first_line}\x1b[0m#{other_lines}"


# Private Helpers
output = (level, msg) ->
  util.log(msg) if validLevel(level)

validLevel = (level) ->
  SS.config.log.level >= level

parseParams = (params) ->
  params = util.inspect(params) if params and validLevel(3)
  if params then ': ' + params else ''


# List of UNIX terminal colors
color_codes =
  red:        31
  magenta:    35
  cyan:       36
  green:      32
