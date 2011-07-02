describe "Configurator", ->

  beforeEach ->
    # Mock the SS global object
    global.SS = {}
    global.configurator = require '../../lib/configurator.coffee'
    # Load the extensions.js helper functions
    require '../../lib/extensions.js'
    global.fs = require 'fs'
    global.mode = 0755
  
  # This is the public function for configurator. 
  # It loads the default app configuration,
  # then it merges in the app's configuration,
  # then it merges in the app's environment-specific
  # configuration, if it exists.
  # 
  describe "configure", ->
    it "should set the SS.config's default values", ->
      expect(SS.config).toEqual undefined
      configurator.configure()
      expect(typeof(SS.config)).toEqual "object"
      # I might want to check that it loads certain values,
      # but to do that, I would need to define the default 
      # config in an accessible way, and load that for
      # comparison.
      
    it "should set the SS.config's default environment values", ->
      # Note, these values are statically defined in the test
      # TODO - write a better way to test for setting default 
      # environment values
      SS.env = 'development'
      configurator.configure()
      expect(SS.config.pack_assets).toEqual false
      SS.env = 'production'
      configurator.configure()
      expect(SS.config.throw_errors).toEqual false
      expect(SS.config.log.level).toEqual 0
      expect(SS.config.client.log.level).toEqual 0
      
    # These tests ensure that the application config overrides
    # the default config, and that the environment config overrides
    # the application config.
    #
    # NOTE - It would be nice to use asynchronous tests in place of calling synchronous functions.
    describe "merging config files", ->
    
      beforeEach ->
        fs.mkdirSync 'lab', mode
        fs.mkdirSync 'lab/config', mode
        fs.writeFileSync 'lab/config/app.json', '{"client":{"log":{"level":1}}}'        
        SS.root = "lab"
        SS.env = 'development'
    
      afterEach ->
        fs.unlinkSync 'lab/config/app.json', mode
        fs.rmdirSync 'lab/config', mode
        fs.rmdirSync 'lab', mode        
    
      it "should set the SS.config application values from the /config/app.json file, if it exists", ->            
        configurator.configure()
        expect(SS.config.client.log.level).toEqual 1

      it "should set the SS.config application values from the environment config file, if it exists", ->
        # Setup
        fs.mkdirSync 'lab/config/environments', mode
        fs.writeFileSync 'lab/config/environments/development.json', '{"client":{"log":{"level":2}}}'
        
        configurator.configure()
        expect(SS.config.client.log.level).toEqual 2

        # Teardown
        fs.unlinkSync 'lab/config/environments/development.json', mode
        fs.rmdirSync 'lab/config/environments', mode