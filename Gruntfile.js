/*global module:false*/

module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-ngdocs');

    /*
        Project configuration
        According to https://github.com/gruntjs/grunt-contrib-jshint/pull/24#issuecomment-14976842
        jshint options could not be merged with .jshintrc
        so we need to use

        options: grunt.util._.merge({}, grunt.file.readJSON('.jshintrc')),

        to merge the required options

    */
    grunt.initConfig({
        docsSever: {
            port      : 9001,
        },
        clean: {
            docs: {
                src: ['docs']
            }
        },
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
                            'test/helpers/connect.js',
                            'test/fixtures/**'
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
        ngdocs: {
            options: {
                title: 'SocketStream',
                scripts: [
                    'angular.js',
                ],
                styles: [
                    // 'src/docs/site/css/main.css'
                ],
                // navTemplate: 'src/docs/site/header.html',
                discussions: {
                    shortName: 'socketstream',
                    url: 'http://socketstream.org',
                    dev: true
                },
                html5Mode: false,
                bestMatch: false
            },
            tutorials: {
                src: ['src/docs/tutorials/**/*.ngdoc'],
                title: 'Tutorials'
            },
            api: {
                src: ['lib/**/*.js'],
                title: 'API Documentation'
            },
            demos: {
                src: ['src/docs/demos/**/*.ngdoc'],
                title: 'Demos'
            },
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            docsSite: ['delta:docs', 'connect:docsSite']
        },
        delta: {
            docs: {
                options: {
                    interrupt: true,
                    atBegin: true
                },
                files: [
                    'lib/**',
                    'src/**'
                ],
                tasks: ['clean', 'ngdocs']
            }
        },
        connect: {
            options: {
            },
            docsSite: {
                options: {
                    port     : '<%= docsSever.port %>',
                    keepalive: true,
                    base     : 'docs',
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

    //Rename our watch task to 'delta', then make actual 'watch'
    grunt.renameTask('watch', 'delta');

    grunt.registerTask('default', 'Default task which runs all the required subtasks', ['jshint', 'test']);
    grunt.registerTask('test', 'Test everything', ['mochaTest']);
    grunt.registerTask('build:docs', 'Build documentation', ['clean', 'ngdocs', 'connect']);
    grunt.registerTask('watch:docs', 'Tracks checnges and  re-building documentation', ['concurrent:docsSite']);
}