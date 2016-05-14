'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      server: '.tmp',
      dist: 'dist',
    },

    useminPrepare: {
      html: 'src/template.html',
      options: {
        dest: '.tmp',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    replace: {
      dist: {
        src: ['src/template.html'],
        dest: '.tmp/',
        options: {
          processTemplates: false,
        },
        replacements: [{
          from: /<!-- build:js main\.js -->[\s\S]*?<!-- endbuild -->/g,
          to: function() {
            var js = grunt.file.read('.tmp/main.js');
            return '<script>' + js + '</script>';
          }
        }, {
          from: /<!-- build:css main\.css -->[\s\S]*?<!-- endbuild -->/g,
          to: function() {
            var css = grunt.file.read('.tmp/main.css');
            return '<style>' + css + '</style>';
          }
        }]
      },
      server: {
        src: ['src/template.html'],
        dest: '.tmp/',
        options: {
          processTemplates: false,
        },
        replacements: [{
          from: /<%([^%]+)%>/g,
          to: function(matchWord, index, fullText, matches) {
            if (grunt.file.exists('src/fields.json')) {
              var fields = grunt.file.readJSON('src/fields.json');
              if (fields.hasOwnProperty(matches[0])) {
                switch (typeof fields[matches[0]]) {
                  case 'object':
                  case 'array':
                    return JSON.stringify(fields[matches[0]]);
                    break;
                  default:
                    return fields[matches[0]];
                }
              }
            }

            return matchWord;
          }
        }]
      }
    },

    copy: {
      dist: {
        files: [{
          src: ['.tmp/template.html'],
          dest: 'dist/template.html',
        }, {
          src: ['src/config.json'],
          dest: 'dist/config.json',
        }]
      }
    },

    connect: {
      options: {
        port: 8080,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35730
      },
      livereload: {
        options: {
          open: 'http://0.0.0.0:8080/template.html',
          base: 'src',
          middleware: [
            function (req, res, next) {
              if(req.url == '/template.html') {
                var html = grunt.file.read('.tmp/template.html');
                res.end(html);
              } else {
                res.end(grunt.file.read('src' + req.url.split('?')[0]));
              }
            }
          ]
        }
      },
    },

    watch: {
      js: {
        files: ['src/scripts/**/*.js'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      html: {
        files: ['src/template.html'],
        tasks: ['replace:server'],
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '.tmp/**/*.html',
          'src/styles/**/*.css',
        ]
      }
    },
  });

  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
    grunt.task.run([
      'clean:server',
      'replace:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build',[
    'clean',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'replace:dist',
    'copy:dist',
  ])

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['build']);

};