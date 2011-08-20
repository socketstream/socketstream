# Backend Loader
# --------------
# Loads all the files the backend server requires and organises them into API trees


util = require('util')

utils = require('../utils')
file_utils = require('../utils/file')


module.exports = load = 

  dbConfigFile: ->
    try
      require("#{SS.root}/config/db")
    catch e
      throw e unless e.message.match(/^Cannot find module/)

  # Turns directories into an object tree
  fileTrees: ->
    ['shared','server','models'].map (api) ->
      try
        file_utils.readDirSync("#{SS.root}/app/#{api}")
      catch e
        {}
  
  # Server-side files
  serverSideFiles: (trees) ->
    # Load Shared functions into SS.shared
    load.apiTree "#{SS.root}/app/shared", trees[0], (mod, mod_name, dest, ary) -> 
      dest[mod_name] = mod
    
    # Load Server-side functions into SS.server
    load.apiTree "#{SS.root}/app/server", trees[1], (mod, mod_name, dest, ary) ->
      dest[mod_name] = mod.actions
      SS.internal.authenticate[ary.join('.')] = mod.authenticate if mod.authenticate
    
    # Load Realtime Models into SS.models
    load.apiTree "#{SS.root}/app/models", trees[2], (mod, mod_name, dest, ary) ->
      model_spec = mod[mod_name]
      dest[mod_name] = require("./realtime_models/adapters/#{model_spec.adapter}").init(mod_name, model_spec, exports)
      Object.defineProperty(dest[mod_name], '_rtm', {value: model_spec, enumerable: false})
  
  # Helper to recursively load all files in a dir and attach them to an attribtue of the SS object
  apiTree: (dir, tree, action) ->
    recursively = (destination, ary, path, counter_name, index = 0) ->
      element = ary[index]
      dest = utils.getFromTree(destination, ary, index)
      if ary.length == (index + 1)
        mod = require(path)
        action(mod, element, dest, ary)
        SS.internal.counters.files_loaded[counter_name]++
      else
        dest[element] = {} unless dest.hasOwnProperty(element)
        arguments.callee(destination, ary, path, counter_name, (index+1))

    if tree
      path = dir.split('/')
      slashes_to_remove = path.length
      api_name = path.reverse()[0]
      tree.files.forEach (path) ->

        ary = path.split('/').slice(slashes_to_remove)
        mod_name = ary.pop()
        ary.push(mod_name.split('.')[0])

        recursively(SS[api_name], ary, path, api_name)
        
        # Turn the API tree into a string we can easily send to the client to be re-constructed into functions
        SS.internal.api_string[api_name] = apiToString(SS[api_name])
  
  # Load Event Emitter in SS.events and any custom server-side events if present
  serverSideEvents: ->
    EventEmitter = require('events').EventEmitter
    SS.events = new EventEmitter
    try
      require("#{SS.root}/config/events")
    catch e
      throw e unless e.message.match(/^Cannot find module/)


# Private Helpers

# We convert the object tree for sending in the most condensed way possible. The client will re-construct the api into SS.server and SS.shared from this string
apiToString = (obj) ->
  util.inspect(SS.server, false, 1000).replace(/\[Function\]/g, 'true')
