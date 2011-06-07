# Rate Limiting
# -------------
# Basic things we can do to stop DDOS attacks. Far more to come in the future


# Test to see if the RPS have been exceeded for this session
exports.exceeded = (client) ->
  return true if client.rps_exceeded

  ts = Number(new Date())
  ts = ts - (ts % 600)
  
  if client.rps_ts == ts
    client.rps_count++
  else
    client.rps_ts = ts
    client.rps_count = 1
    
  client.rps_exceeded = (client.rps_count > SS.config.limiter.websockets.rps)
