# REST access for RTM
# -------------------
# Totally experimental for now. Not used.

# Process incoming REST requests from the API
exports.processRequest = (actions, params, request, format, cb) ->
  model_name = actions[0]
  action = actions[1]
  model = SS.models[model_name]
  throw ['model_not_found',"The '#{model_name}' model you are looking for can not be found"] if model == undefined
  throw ['model_not_rtm',"The '#{model_name}' model does not appear to be a valid Realtime Model"] unless model._rtm?
  throw ['rest_not_enabled','REST support is not enabled for this model'] unless model._rtm.rest and model._rtm.rest.enabled
  request_type = requestType(action, request.method)
  try  
    process.init(request, model, action, params, cb)[request_type]()
  catch e
    throw ['rest_request_error', e.stack]


# PRIVATE

requestType = (action, http_method) ->
  if action
    return 'delete' if http_method == 'DELETE'
    return 'update' if http_method == 'PUT'
    return 'show'   if http_method == 'GET'
  return 'create'   if http_method == 'POST'
  return 'index'


# CRUD Methods
process =

  init: (@request, @model, @action, @params, @cb) ->
    @
  
  create: ->
    parseIncomingData @request, (data) =>
      obj = new(@model)
      obj = obj.extend(data)
      obj.save (err) =>
        if err
          throw ['rest_create', err]
        else
          @cb(true)
    
  show: ->
    @model.findById @action, @_fields(), (err, obj) => @cb(obj)
  
  update: ->
    parseIncomingData @request, (data) =>
      @model.findById @action, @_fields(), (err, obj) =>
        obj = obj.extend(data)
        obj.save()
        @cb(true)
  
  delete: ->
    @model.findById @action, @_fields(), (err, obj) =>
      obj.remove()
      @cb(true)
  
  index: ->
    @model.find @params, @_fields(), (err, data) => @cb(data)
  
  _fields: ->
    if @model._rtm.rest.fields and typeof(@model._rtm.rest.fields) == 'object'
      @model._rtm.rest.fields
    else
      {}


parseIncomingData = (request, cb) ->
  incoming_data = ''
  request.on 'data', (chunk) -> incoming_data += chunk.toString()
  request.on 'end', ->
    output = {}
    try
      incoming_data.split('&').forEach (field) ->
        f = field.split('=')
        output[f[0]] = f[1]
      cb(output)
    catch e
      throw ['rest_unable_to_parse_params', 'Unable to parse incoming params']
  

