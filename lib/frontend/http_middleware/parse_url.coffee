# Middleware: URL Parser
# ----------------------
# Parses incoming URL into file extension, initial dir etc and adds this object to request.ss.parsedURL for use later on

module.exports = ->

  (request, response, next) ->

    request.ss = {}
    raw = request.url
    [no_params, params] = raw.split('?')
    [url, extension] = no_params.split('.')
    [ignore, initialDir, actions...] = url.split('/')
    request.ss.parsedURL = 
      extension:   (if extension and extension != '/' then extension.toLowerCase() else null)
      initialDir:  (if initialDir then initialDir.toLowerCase() else null)
      actions:     (actions || null)
      params:      (params || null)
      path:        (if actions.length > 0 then [actions.join('/'), extension].join('.') else '')
      isRoot:      (u = url.split('?')[0].split('/'); u.length == 2 and !raw.split('?')[0].match(/\./))
    next()
