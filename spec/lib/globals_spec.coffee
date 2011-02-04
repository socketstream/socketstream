fs = require 'fs'
fs.mkdirSync './vendor', 0755
require '../../lib/globals.js'

describe '$SS', ->

  beforeEach ->
    #create vendor directory to make globals shut up
    # fs.mkdirSync './vendor', 0755 unless fs.readdirSync('')['vendor'] is not -1 TODO - make this work
    
  afterEach ->
    # remove vendor directory
    fs.rmdirSync './vendor', 0755
 
  it 'should be a shorthand for SocketStream', ->
    expect($SS).toEqual(SocketStream)