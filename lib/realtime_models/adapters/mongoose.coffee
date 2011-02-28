# RTM Mongoose Adapter
# --------------------
# Wraps the Mongoose Adapter

exports.init = (model_name, model_spec, rtm) ->
  schema = new Schema(model_spec.schema)
  mongoose.model(model_name, schema)
  mongoose.model(model_name)
