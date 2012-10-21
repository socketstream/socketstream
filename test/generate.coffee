fork = require('child_process').fork
fs = require('fs')
generate = require('../src/cli/generate')
http = require('http')
path = require('path')
rimraf = require('rimraf')
should = require('should')

describe 'generate', ->
  appname = path.join(__dirname, 'testdata_generatedapp')
  script = path.join(appname, 'app.js')
  process = null
  before ->
    rimraf.sync appname
    fs.existsSync(appname).should.be.false

  it 'generates successfully minimal application', (done) ->
    program = {}
    program.args = ['program_name', appname]
    program.minimal = true
    generate.generate(program)
    fs.existsSync(appname).should.be.true
    require(script).should.have.property.main
    process = fork(script, {cwd: appname})
    process.on('message', (message) ->
      message['ss-server-port'].should.be.within(1024, 65535)
      message['ss-console-port'].should.eql(message['ss-server-port']+1)
      req = http.get "http://localhost:" + message['ss-server-port'], (res) ->
        res.statusCode.should.eql(200)
        data = ""
        res.on 'data', (chunk) ->
          data += chunk
        res.on 'end', ->
          data.should.match(/Welcome to your new realtime app!/)
          done()

      req.on 'error', (e) ->
        done(e.message);
    )

  after ->
    if process
      process.kill()
    rimraf.sync appname
