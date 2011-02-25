# RTM Redis Adapter
# -----------------
# A dead simple Redis adapter that obeys the same interface as Mongoose where possible

# Set Redis key prefix
key = "ss:rtm"

# Instance methods
class Model
  
  save: (cb) ->
    hash = {}
    Model.rtm.schema.keys().forEach (field) =>
      hash[field] = @[field] if @[field]?
    throw ['rtm_redis_no_id', 'You must specify an ID before saving the model to Redis as it cannot be auto-generated'] unless @id?
    R.hmset "#{key}:#{Model.model_name}:#{@id}", hash, (err, data) -> cb(err)

# Find a record by ID
Model.findById = (id, fields, cb) ->
  R.hgetall "#{key}:#{@model_name}:#{id}", (err, data) ->
    if err
      throw ['rtm_redis_find_error', err]
    else
      cb(null, data)
      

# Export model
exports.init = (model_name, rtm) ->
  Model.model_name = model_name
  Model.rtm = rtm
  Model

    

  