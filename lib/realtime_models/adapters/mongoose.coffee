# RTM Mongoose Adapter
# --------------------
# Wraps the Mongoose Adapter

exports.init = (model_name, model_spec, rtm) ->
  
  # Define the schema
  schema = new Schema(model_spec.schema)
  
  # If virtual attributes are declared, add them here
  if model_spec.virtual
    for attr, methods of model_spec.virtual
      a = schema.virtual(attr)
      for getOrSet, funk of methods
        a[getOrSet](funk)
        
  # Middleware
  if model_spec.pre
    for method, funk of model_spec.pre
      schema.pre(method, funk)
  
  # Add the schmea to this model
  mongoose.model(model_name, schema)
  
  # Return an instance of the model
  mongoose.model(model_name)
