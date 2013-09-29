/*global module:false*/

module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    /* Project configuration */
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc    : '.jshintrc',
                jshintignore: '.jshintignore'
            },
            server: {
                /*
                   TODO add option "devel: true" for production linting

                   This option defines globals that are usually used for
                   logging poor-man's debugging: console, alert, etc.
                   It is usually a good idea to not ship them in production because,
                   for example, console.log breaks in legacy versions of Internet Explorer.

                   http://www.jshint.com/docs/options/#devel
                 */
                options: {
                    ignores: [
                        'lib/client/system'
                    ]
                },
                files: {
                    src: [
                        'Gruntfile.js',
                        'test/**/*.js',
                        'lib/**/*.js'
                    ]
                }
            },
            client: {
                options: {
                    browser: true,
                    node   : false,
                    ignores: []
                },
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