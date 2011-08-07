# RTM Redis Adapter
# -----------------
# A dead simple Redis adapter that obeys the same interface as Mongoose where possible
# TODO: Add casting as per schema and validations

# Instance methods
class Model
  
  constructor: (@doc = {}) ->
    @isNew = true
    
    # Make a copy of the original data so we can run comparisons
    @original_doc = @doc
    
    # Get fields from schema
    @fields = Model.definition.schema.keys()
    @fields.push('id')
    @fields
    
    # Define getters and setters
    @fields.forEach (field) =>
      @__defineGetter__ field, => @doc[field]
      @__defineSetter__ field, (value) => @doc[field] = value
    
    true
  
  save: (cb = ->) ->
    throw ['rtm_redis_no_id', 'You must specify an "id" before saving the model to Redis'] unless @doc.id?
    R.hmset key(@doc.id), @doc, (err, data) =>
      if err
        cb(err)
      else
        changes = {}
        @fields.forEach (key) =>
          changes[key] = @doc[key] if @doc[key] != @original_doc[key]
        if changes.keys().any()
          action = if @isNew then 'add' else 'update'
          Model.rtm.broadcast({action: action, model: Model.rtm_name, id: @doc.id, attributes: changes})
        @original_doc = @doc
        @isNew = false
        cb(null)
      true

  remove: (cb = ->) ->
    @fields.forEach (field) =>
      R.hdel key(@doc.id), field, (err) ->
        cb(true)

  toJSON: ->
    @doc


# Find a record by ID
Model.findById = (id, fields, cb) ->
  R.hgetall key(id), (err, data) ->
    if err
      throw ['rtm_redis_find_error', err]
    else
      obj = new Model(data)
      obj.isNew = false
      cb(null, obj)

# Finds all the keys associated with this model, in no particular order
Model.find = (where, fields, cb) ->
  output = []
  R.keys "#{key()}*", (err, keys) ->
    total_num = keys.length
    keys.forEach (key, i) ->
      id = key.split(':').pop()
      Model.findById id, {}, (err, data) ->
        output.push(data)
        return cb(null, output) if (i+1) == total_num # Only send reply once all callbacks have completed
        
# Export model
exports.init = (name, definition, rtm) ->
  Model.rtm_name = name
  Model.rtm = rtm
  Model.definition = definition
  Model

# Private methods
key = (id = null) ->
  k = ["ss:rtm", Model.rtm_name]
  k.push(id) if id?
  k.join(':')
