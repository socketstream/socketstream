'use strict';



var exec                                  = require('child_process').exec,
    ac                                    = require('../../helpers/assertionCounter'),
    fs                                    = require('fs'),
    path                                  = require('path'),
    async                                 = require('async'),
    generate                              = require(path.join(process.env.PWD, 'lib/cli/generate')),
    demoAppEndDir                         = 'test/results/waaa',
    demoAppPath                           = path.join(process.env.PWD, demoAppEndDir),
    program                               = {},
    logs                                  = [],
    newProjectDirectoriesThatShouldExist  = [];



/**
 * Executes a child process to forcefully remove
 * a directory containing files
 *
 * @param  {String}   dirPath The path of the directory to remove
 * @param  {Function} cb      [The function to execute when finished
 * @return {Void}
 */
function removeForcefully (dirPath, cb) {
    exec('rm -rf '+ dirPath, function(err){
        cb(err);
    });
}



/**
 * Executes a child process to forcefully remove
 * a directory containing files
 *
 * @param  {String}   dirPath The path of the directory to remove
 * @param  {Function} cb      The function to execute when finished
 * @return {Void}
 */
function removeDirectoryIfExists (dirPath, cb) {
    fs.exists(dirPath, function(exists){
        if (exists) {
            removeForcefully(dirPath, cb);
        } else {
            cb();
        }
    });
}



/**
 * Hooking function for console.log interception
 *
 * @return {function}
 */
function hookLog () {
    var _stream   = process.stdout,
        old_write = _stream.write; // Reference default write method

    /* _stream now write with our shiny function */
    _stream.write = function(string) {
        logs.push(string.replace(/\n$/, ''));
    };

    return function() {
        /* reset to the default write method */
        _stream.write = old_write;
    };
}



describe('generate', function () {



    beforeEach(function (done) {

        ac.reset();

        logs    = [];
        
        program = {
          args: ['new', demoAppEndDir]
        };
        
        newProjectDirectoriesThatShouldExist = [
          demoAppEndDir,
          path.join(demoAppPath, '/client'),
          path.join(demoAppPath, '/client/code'),
          path.join(demoAppPath, '/client/code/app'),
          path.join(demoAppPath, '/client/code/libs'),
          path.join(demoAppPath, '/client/views'),
          path.join(demoAppPath, '/client/css'),
          path.join(demoAppPath, '/client/css/libs'),
          path.join(demoAppPath, '/client/templates'),
          path.join(demoAppPath, '/client/static'),
          path.join(demoAppPath, '/client/static/images'),
          path.join(demoAppPath, '/server'),
          path.join(demoAppPath, '/server/rpc'),
          path.join(demoAppPath, '/server/middleware')
        ];

        removeDirectoryIfExists(demoAppPath, done);

    });



    afterEach(function (done) {
        removeDirectoryIfExists(demoAppPath, done);
    });



    it('should generate an app inside of a folder with a unique name', function (done) {

        ac.expect(1);

        generate.generate(program);

        /* Using 'async' library to check if all the required project's folders exist */
        async.reject(newProjectDirectoriesThatShouldExist, fs.exists, function (result) {
            result.length.should.equal(0).andCheck();
            ac.check(done);
        });

    });



    it('should raise an error if the name of the app matches the name of an existing folder', function (done) {

        ac.expect(2);

        fs.mkdir(demoAppPath, function(err) {

            var unHookLog = hookLog(); // creating a hook function for console.log
            generate.generate(program);
            unHookLog();

            logs.length.should.equal(1).andCheck();
            logs[0].toString().should.equal('Sorry the \'' + demoAppEndDir + '\' directory already exists. Please choose another name for your app.')
            .andCheck();

            if (err) {
                done(err);
            } else {
                ac.check(done);
            }

        });

    });



    it('should generate an app with coffeescript files if coffeescript was requested', function (done) {

        ac.expect(1);

        var newProjectFilesThatShouldExistWhenUsingCoffeeScript = [
            path.join(demoAppPath, '/client/code/app/app.coffee'),
            path.join(demoAppPath, '/client/code/app/entry.coffee'),
            path.join(demoAppPath, '/server/middleware/example.coffee'),
            path.join(demoAppPath, '/server/rpc/demo.coffee')
        ];

        program.coffee = true;

        generate.generate(program);

        /* Using 'async' library to check if all the required project's coffeescript files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingCoffeeScript, fs.exists, function (result) {
            result.length.should.equal(0).andCheck();
            ac.check(done);
        });

    });



    it('should raise an error if no name is provided for the app', function (done) {

        ac.expect(2);

        program.args = ['new'];

        var unHookLog = hookLog(); // creating a hook function for console.log
        generate.generate(program);
        unHookLog();

        logs.length.should.equal(1).andCheck();
        logs[0].toString().should.equal('Please provide a name for your application: $> socketstream new <MyAppName>')
        .andCheck();

        ac.check(done);

    });



    it('should generate an app with jade templates if jade was requested', function (done) {

        ac.expect(1);

        var newProjectFilesThatShouldExistWhenUsingJade = [
            path.join(demoAppPath, '/client/templates/chat/message.jade'),
            path.join(demoAppPath, '/client/views/app.jade')
        ];

        program.jade = true;

        generate.generate(program);

        /* Using 'async' library to check if all the required project's coffeescript files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingJade, fs.exists, function (result) {
            result.length.should.equal(0).andCheck();
            ac.check(done);
        });

    });



    it('should generate an app with no demo code, if a minimal app was requested', function (done) {
        
        ac.expect(1);

        var newProjectFilesThatBelongToDemo = [
            path.join(demoAppPath, '/client/static/images/logo.png'),
            path.join(demoAppPath, '/server/middleware/example.js'),
            path.join(demoAppPath, '/server/rpc/demo.js'),
            path.join(demoAppPath, '/client/css/libs/reset.css'),
            path.join(demoAppPath, '/client/templates/chat/message.html')
        ];

        program.minimal = true;

        generate.generate(program);

        /* Using 'async' library to check if all the required project's coffeescript files exist */
        async.reject(newProjectFilesThatBelongToDemo, fs.exists, function (result) {
            result.length.should.equal(newProjectFilesThatBelongToDemo.length).andCheck();
            ac.check(done);
        });

    });



    it('should generate an app with the ss-console library, if the repl library was requested', function (done) {

        ac.expect(5);

        program.repl = true;

        generate.generate(program);

        fs.readFile(path.join(demoAppPath,'/app.js'), 'utf-8', function (err, appJsContents) {

            appJsContents.indexOf('// Start Console Server (REPL)').should.not.equal(-1).andCheck();
            appJsContents.indexOf('// To install client: sudo npm install -g ss-console').should.not.equal(-1).andCheck();
            appJsContents.indexOf('// To connect: ss-console <optional_host_or_port>').should.not.equal(-1).andCheck();
            appJsContents.indexOf('var consoleServer = require(\'ss-console\')(ss);').should.not.equal(-1).andCheck();
            appJsContents.indexOf('consoleServer.listen(5000);').should.not.equal(-1).andCheck();
            ac.check(done);

        });

    });



});