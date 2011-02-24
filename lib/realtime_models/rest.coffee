# REST access for RTM
# -------------------

# Process incoming REST requests from the API
exports.processRequest = (actions, params, http_method, format, cb) ->
  model_name = actions[0]
  action = actions[1]
  model = $SS.model[model_name]
  throw ['model_not_found',"The '#{model_name}' model you are looking for can not be found"] if model == undefined
  throw ['rest_not_enabled','REST support is not enabled for this model'] unless model.rest and model.rest.enabled
  request_type = requestType(action, http_method)
  try  
    process.init(model, action, cb)[request_type]()
  catch e
    throw ['rest_request_error', e.stack]

requestType = (action, http_method) ->
  return 'delete' if http_method == 'DELETE'
  return 'update' if http_method == 'POST' and action
  return 'show'   if http_method == 'GET' and action
  return 'index'


process =

  init: (@model, @action, @cb) ->
    @
    
  show: ->
    @model.db.findById @action, @_fields(), (err, data) => @cb(data)
  
  index: ->
    @model.db.find {}, @_fields(), (err, data) => @cb(data)
  
  _fields: ->
    if @model.rest.fields and @model.rest.fields.length > 0
      out = {}
      @model.fields.forEach (field) -> out[field] = 1
      out
    else
      {}
  
  
    
  
  
