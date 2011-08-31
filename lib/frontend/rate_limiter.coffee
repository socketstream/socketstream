# Rate Limiting Module
# --------------------
# Basic things we can do to stop DDOS attacks. Far more to come in the future


# Test to see if the RPS have been exceeded for this session
exports.exceeded = (socket) ->
  return true if socket.ss.rps_exceeded

  ts = Number(new Date())
  ts = ts - (ts % 600)
  
  if socket.ss.rps_ts == ts
    socket.ss.rps_count++
  else
    socket.ss.rps_ts = ts
    socket.ss.rps_count = 1
    
  socket.ss.rps_exceeded = (socket.ss.rps_count > SS.config.rate_limiter.websockets.rps)
