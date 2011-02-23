# RTM Mongoose Adapter
# --------------------

exports.init = (model_name, rtm) ->
  schema = new Schema(rtm.schema)
  mongoose.model(model_name, schema)
  mongoose.model(model_name)
