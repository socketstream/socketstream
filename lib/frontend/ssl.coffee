# HTTPS
# -----
# Manages HTTPS / SSL / TLS keys

fs = require('fs')
util = require('util')

# Load the SSL keys
exports.keys =

  options: ->
    try
      path = SS.root + '/config/ssl_certs/' + SS.config.https.cert_name
      output = load "#{path}.key.pem", "#{path}.cert.pem", "#{path}.ca.pem"
      util.log "Loaded custom SSL key: /config/ssl_certs/#{SS.config.https.cert_name}.cert.pem"
      output
    catch e
      path = __dirname + '/../../ssl_certs'
      output = load "#{path}/key.pem", "#{path}/cert.pem"
      util.log "Custom SSL keys not found. Using internal self-signed certificates"
      output


# PRIVATE

load = (key, cert, ca = null) ->
  output = 
    key:  fs.readFileSync(key) 
    cert: fs.readFileSync(cert)
  output.ca = [fs.readFileSync(ca)] if ca
  output
