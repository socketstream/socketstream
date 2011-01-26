Session = require '../../lib/session.coffee'

describe 'RedisSession', ->
  
  describe "init()", ->
  
    it "should have an id", ->
      session = new Session.RedisSession()
      expect(session.id).toEqual null
  
  describe "_mergeAttributes", ->
    
    it "should merge the attributes of one object with another, and return the combined object", ->
      old_hash = {_id: 'd9h2398hd93h29h9392dh291h91olsj', name: 'Cecil'}
      new_hash = {name: 'Cecil Van Percywinks', job: 'Test Dummy'}
      expected_hash = {_id: 'd9h2398hd93h29h9392dh291h91olsj', name: 'Cecil Van Percywinks', job: 'Test Dummy'}
      session = new Session.RedisSession()
      expect(session._mergeAttributes(old_hash, new_hash)).toEqual(expected_hash)