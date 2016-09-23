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

    usemin: {
      html: '.tmp/template.html',
      options: {
        assetsDirs: [
          '.tmp',
        ],
        blockReplacements: {
          css: function(block) {
            return '<style>' + grunt.file.read('.tmp/' + block.dest) + '</style>';
          },
          js: function(block) {
            return '<script>' + grunt.file.read('.tmp/' + block.dest) + '</script>';
          }
        }
      }
    },

    replace: {
      server: {
        src: ['src/template.html'],
        dest: '.tmp/index.html',
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
          src: ['src/template.html'],
          dest: '.tmp/template.html',
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
        hostname: 'localhost',
        livereload: 35730
      },
      livereload: {
        options: {
          open: true,
          base: ['src', '.tmp'],
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

    htmlmin: { // Task 
      dist: { // Target 
        options: { // Target options 
          removeComments: true,
          collapseWhitespace: true
        },
        files: { // Dictionary of files 
          'dist/template.html': '.tmp/template.html', // 'destination': 'source' 
        }
      }
    }
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
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
    if (!grunt.file.exists('src/template.html')) {
      grunt.fail.fatal('src目录下不存在template.html文件，无法继续！');
    }

    grunt.task.run([
      'clean:server',
      'replace:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', function(target) {
    if (!grunt.file.exists('src/template.html')) {
      grunt.fail.fatal('src目录下不存在template.html文件，无法继续！');
    }

    if (!grunt.file.exists('src/config.json')) {
      grunt.fail.fatal('src目录下不存在config.json文件，无法继续！');
    }

    var config = grunt.file.read('src/config.json');
    config = config.replace(/\s/g, '');
    if (!config) {
      grunt.fail.warn('src/config.json中还没有配置模板字段。');
    } else {
      try {
        JSON.parse(config);
      } catch (e) {
        grunt.fail.fatal('src/config.json内容不是正确的json，请仔细检查！任务终止。' + e);
      }
    }

    var tasks = [
      'clean',
      'useminPrepare',
      'concat:generated',
      'cssmin:generated',
      'uglify:generated',
      'copy:dist',
      'usemin',
      'htmlmin:dist',
    ];

    grunt.task.run(tasks);
  });

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['build']);

};