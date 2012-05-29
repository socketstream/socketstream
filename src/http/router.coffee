# HTTP Router
# -----------
# Right now the router is simply an EventEmitter. This may change in the future

EventEmitter2 = require('eventemitter2').EventEmitter2

class exports.Router

  constructor: ->
    @ee = new EventEmitter2
      wildcard: true
      delimiter: '?'

  # Try the original route first for speed. If none exists, recursively fall back until we find a route, if possible
  # This allows us to fully support HTML5 pushState 'mock routing' across multiple single-page clients
  route: (url, req, res) ->
    # TODO allow for widcards with listeners = @ee.listeners(url) - @ee.listenersAny(url)
    if @ee.listeners(url).length > 0
      @ee.emit(url, req, res)
      true
    else
      if url == '/'
        return false

      if url.indexOf('?') >= 0
        sr = url.split('?')
      else
        sr = url.split('/')

      sr.pop()
      newUrl = sr.join('/')
      newUrl = '/' unless newUrl.length > 0
      @route(newUrl, req, res)
      
  on: (url, cb) ->
    if url.substring(0,1) == '/' && url.indexOf(' ') == -1
      @ee.on(url, cb)
    else
      throw new Error(url + ' is not a valid URL. Valid URLs must start with /')