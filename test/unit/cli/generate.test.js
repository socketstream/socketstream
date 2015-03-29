'use strict';

var exec                                  = require('child_process').exec,
    logHook                               = require('../../helpers/logHook.js'),
    fs                                    = require('fs'),
    path                                  = require('path'),
    async                                 = require('async'),
    generate                              = require('../../../lib/cli/generate'),
    demoAppEndDir                         = 'test/results/waaa',
    demoAppPath                           = path.join(__dirname,'../../..', demoAppEndDir),
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

describe('lib/cli/generate', function () {

    beforeEach(function (done) {



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

        /* hide console.log output to make Mocha output clear */
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's folders exist */
        async.reject(newProjectDirectoriesThatShouldExist, fs.exists, function (result) {
            result.length.should.equal(0);
            done();
        });

    });

    it('should raise an error if the name of the app matches the name of an existing folder', function (done) {

        fs.mkdir(demoAppPath, function(err) {

            // Call for hook function for console.log
            logHook.on();
            generate.generate(program);
            logs = logHook.off();

            logs.length.should.equal(1);
            logs[0].toString().should.equal('Sorry the \'' + demoAppEndDir + '\' directory already exists. Please choose another name for your app.')
            ;

            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });

    it('should generate an app with coffeescript files if coffeescript was requested', function (done) {

        var newProjectFilesThatShouldExistWhenUsingCoffeeScript = [
            path.join(demoAppPath, '/client/code/app/app.coffee'),
            path.join(demoAppPath, '/client/code/app/entry.coffee'),
            path.join(demoAppPath, '/server/middleware/example.coffee'),
            path.join(demoAppPath, '/server/rpc/demo.coffee')
        ];

        program.coffee = true;

        /* hide console.log output to make Mocha output clear */
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's coffeescript files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingCoffeeScript, fs.exists, function (result) {
            result.length.should.equal(0);
            done();
        });
    });

    it('should raise an error if no name is provided for the app', function (done) {

        program.args = ['new'];

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        logs.length.should.equal(1);
        logs[0].toString().should.equal('Please provide a name for your application: $> socketstream new <MyAppName>')
        ;

        done();
    });

    it('should generate an app with jade templates if jade was requested', function (done) {

        var newProjectFilesThatShouldExistWhenUsingJade = [
            path.join(demoAppPath, '/client/templates/chat/message.jade'),
            path.join(demoAppPath, '/client/views/app.jade')
        ];

        program.jade = true;

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's jade files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingJade, fs.exists, function (result) {
            result.length.should.equal(0);
            done();
        });

    });

    it('should generate an app with css stylesheets if css was requested', function (done) {

        var newProjectFilesThatShouldExistWhenUsingCss = [
            path.join(demoAppPath, '/client/css/app.css'),
        ];

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's css files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingCss, fs.exists, function (result) {
            result.length.should.equal(0);
            done();
        });

    });

    it('should generate an app with less stylesheets if less was requested', function (done) {

        var newProjectFilesThatShouldExistWhenUsingLess = [
            path.join(demoAppPath, '/client/css/app.less'),
        ];

        program.less = true;

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's less files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingLess, fs.exists, function (result) {
            result.length.should.equal(0);
            done();
        });

    });

    it('should generate an app with stylus stylesheets if stylus was requested', function (done) {

        var newProjectFilesThatShouldExistWhenUsingStylus = [
            path.join(demoAppPath, '/client/css/app.styl'),
        ];

        program.stylus = true;

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's less files exist */
        async.reject(newProjectFilesThatShouldExistWhenUsingStylus, fs.exists, function (result) {
            result.length.should.equal(0);
            done();
        });

    });

    it('should generate an app with no demo code, if a minimal app was requested', function (done) {

        var newProjectFilesThatBelongToDemo = [
            path.join(demoAppPath, '/client/static/images/logo.png'),
            path.join(demoAppPath, '/server/middleware/example.js'),
            path.join(demoAppPath, '/server/rpc/demo.js'),
            path.join(demoAppPath, '/client/css/libs/reset.css'),
            path.join(demoAppPath, '/client/templates/chat/message.html')
        ];

        program.minimal = true;

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        /* Using 'async' library to check if all the required project's coffeescript files exist */
        async.reject(newProjectFilesThatBelongToDemo, fs.exists, function (result) {
            result.length.should.equal(newProjectFilesThatBelongToDemo.length);
            done();
        });
    });

    it('should generate an app with the ss-console library, if the repl library was requested', function (done) {

        program.repl = true;

        // Call for hook function for console.log
        logHook.on();
        generate.generate(program);
        logs = logHook.off();

        fs.readFile(path.join(demoAppPath,'/app.js'), 'utf-8', function (err, appJsContents) {

            appJsContents.indexOf('// Start Console Server (REPL)').should.not.equal(-1);
            appJsContents.indexOf('// To install client: sudo npm install -g ss-console').should.not.equal(-1);
            appJsContents.indexOf('// To connect: ss-console <optional_host_or_port>').should.not.equal(-1);
            appJsContents.indexOf('var consoleServer = require(\'ss-console\')(ss);').should.not.equal(-1);
            appJsContents.indexOf('consoleServer.listen(5000);').should.not.equal(-1);
            done();

        });
    });
});
