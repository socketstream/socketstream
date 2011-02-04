server = require '../../lib/server.coffee'

describe 'server.coffee', ->

  describe 'Server._processIncomingCall(data, client)', ->
  
    it 'should return a nice error message when it craps out', ->
      data = 
        method: 'auth.authorized'
        params: {}
        cb_id: '751934016123414'
        callee: 'auth.authorized'
        options: null
      data.method = 'incorrectServerApiCall' # So we can capture it and tell it to crap out
      serverInstance = new server.Server()
      expect(serverInstance._processIncomingCall JSON.stringify(data), {'session': {'id': '39hd2d9h9283h'}}).toEqual null
      #TODO - capture the console log message
      
  