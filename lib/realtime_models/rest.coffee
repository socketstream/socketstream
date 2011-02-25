# REST access for RTM
# -------------------

# Process incoming REST requests from the API
exports.processRequest = (actions, params, request, format, cb) ->
  model_name = actions[0]
  action = actions[1]
  model = $SS.model[model_name]
  throw ['model_not_found',"The '#{model_name}' model you are looking for can not be found"] if model == undefined
  throw ['rest_not_enabled','REST support is not enabled for this model'] unless model.rest and model.rest.enabled
  request_type = requestType(action, request.method)
  try  
    process.init(request, model, action, params, cb)[request_type]()
  catch e
    throw ['rest_request_error', e.stack]


# PRIVATE

requestType = (action, http_method) ->
  if action
    return 'delete' if http_method == 'DELETE'
    return 'update' if http_method == 'POST'
    return 'show'   if http_method == 'GET'
  return 'create'   if http_method == 'POST'
  return 'index'


# CRUD Methods
process =

  init: (@request, @model, @action, @params, @cb) ->
    @
  
  create: ->
    incoming_data = ''
    @request.on 'data', (chunk) -> incoming_data += chunk.toString()
    @request.on 'end', =>
      instance = new(@model.db)
      try
        fields = incoming_data.split('&')
        fields.forEach (field) ->
          f = field.split('=')
          instance[f[0]] = f[1]
      catch e
        throw ['rest_unable_to_parse_params', 'Unable to parse incoming params']
      
      instance.save (err) =>
        if err
          throw ['rest_create', err]
        else
          @cb(true)
    
  show: ->
    @model.db.findById @action, @_fields(), (err, data) => @cb(data)
  
  index: ->
    @model.db.find @params, @_fields(), (err, data) => @cb(data)
  
  _fields: ->
    if @model.rest.fields and typeof(@model.rest.fields) == 'object'
      @model.rest.fields
    else
      {}
  
  
    
  
  
