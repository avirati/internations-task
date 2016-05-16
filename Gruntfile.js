(function() {
    'use strict';

    module.exports = function(grunt) {

        // Time how long tasks take. Can help when optimizing build times
        require('time-grunt')(grunt);

        grunt.initConfig({
            concat: {
                options: {
                    separator: ';',
                },
                user: {
                    src: [
                        'app/js/utils.js',
                        'app/js/storage.js',
                        'app/js/user.js',
                        'app/js/modal.js',
                    ],
                    dest: 'dist/js/user.main.js',
                },
                group: {
                    src: [
                        'app/js/utils.js',
                        'app/js/storage.js',
                        'app/js/group.js',
                        'app/js/modal.js',
                    ],
                    dest: 'dist/js/group.main.js',
                },
            },
            sass: { // Task
                dist: { // Target
                    options: { // Target options
                        style: 'compressed'
                    },
                    files: { // Dictionary of files
                        'dist/css/main.min.css': 'app/sass/main.scss', // 'destination': 'source'
                    }
                }
            },
            copy: {
                html: {
                    files: [
                        // includes files within path
                        {
                            expand: true,
                            cwd: './app',
                            src: ['index.html'],
                            dest: 'dist/',
                            filter: 'isFile'
                        }, {
                            expand: true,
                            cwd: './app',
                            src: ['modules/**/*.*'],
                            dest: 'dist/',
                        },
                    ],
                },
            },
            watch: {
                scripts: {
                    files: ['app/js/**/*.js'],
                    tasks: ['concat'],
                    options: {
                        spawn: false,
                    },
                },
                styles: {
                    files: ['app/sass/**/*.*'],
                    tasks: ['sass'],
                    options: {
                        spawn: false,
                    },
                },
                templates: {
                    files: ['app/**/*.html'],
                    tasks: ['copy:html'],
                    options: {
                        spawn: false,
                    },
                },
            },
        });

        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-sass');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-watch');

        grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {

        });

        grunt.registerTask('test', [

        ]);

        grunt.registerTask('build', [
            'concat',
            'sass',
            'copy',
            'watch'
        ]);

        grunt.registerTask('default', [
            'test',
            'build'
        ]);
    };
})();
