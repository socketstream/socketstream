/*global module:false*/

module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    /*
        Project configuration
        According to https://github.com/gruntjs/grunt-contrib-jshint/pull/24#issuecomment-14976842
        jshint options could not be merged with .jshintrc
        so we need to use

        options: grunt.util._.merge({}, grunt.file.readJSON('.jshintrc')),

        to merge the required options

    */
    grunt.initConfig({
        jshint: {
            server: {
                /*
                   TODO add option "devel: true" for production linting

                   This option defines globals that are usually used for
                   logging poor-man's debugging: console, alert, etc.
                   It is usually a good idea to not ship them in production because,
                   for example, console.log breaks in legacy versions of Internet Explorer.

                   http://www.jshint.com/docs/options/#devel
                 */
                options: grunt.util._.merge(
                    grunt.file.readJSON('.jshintrc'),
                    {
                        ignores: [
                            'lib/client/system/libs/*',
                            'lib/client/system/modules/*',
                            'lib/websocket/transports/engineio/*',
                            'test/fixtures/project/client/code/libs/*'
                        ]
                    }
                ),
                files: {
                    src: [
                        'Gruntfile.js',
                        'test/**/*.js',
                        'lib/**/*.js',
                        'lib/websocket/transports/engineio/index.js'
                    ]
                }
            },
            client: {
                options: grunt.util._.merge(
                    grunt.file.readJSON('.jshintrc'),
                    {
                        browser: true,
                        node   : false,
                        ignores: [
                            'lib/client/system/libs/*',
                            'lib/client/system/index.js'
                        ]
                    }
                ),
                files: {
                    src: [
                        'lib/client/system/**/*.js'
                    ]
                }
            },
            test: {
                options: {
                    ignores: ['test/fixtures']
                },
                files: {
                    src: [
                        'test/unit/**/*.js'
                    ]
                }
            }
        },
        mochaTest: {
            src: [
                'test/unit/**/*.test.js',
            ],
            options: {
                reporter: 'spec'
            }
        }
    });

    grunt.registerTask('default', 'Default task which runs all the required subtasks', ['jshint', 'test']);
    grunt.registerTask('test', 'Test everything', ['mochaTest']);
}