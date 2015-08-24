module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  var onlyMocks = '<%= yeoman.app %>/**/*.mock.js';
  var onlySources = ['<%= yeoman.app %>/**/*.mdl.js',
                     '<%= yeoman.app %>/**/*.js',
                     '!' + onlyMocks,
                     '!<%= yeoman.app %>/**/*.spec.js'];
  var loginSources = ['<%= yeoman.app %>/*.mdl.js',
                      '<%= yeoman.app %>/**/login-manager.srv.js',
  ]


  grunt.initConfig({
    yeoman: {
      app: 'src',
      tmp: '.tmp',
      dist: 'dist',
      distFileName: 'angular-secured'
    },

    clean: {
      js: ["<%= yeoman.dist %>/*.js",
           "!<%= yeoman.dist %>/*.min.js"],
      all: ["<%= yeoman.dist %>"]
    },

    babel: {
      options: {
        sourceMap: true
      },
      dev: {
        '<%= yeoman.tmp %>/ne-secured.js': ''
      }
    },

    watch: {
      js: {
        files: onlySources,
        tasks: ['concat:js']
      },
      mocks: {
        files: ['<%= yeoman.app %>/**/*.mock.js'],
        tasks: ['concat:mocks']
      }
    },

    concat: {
      options:{
        separator: ';'
      },
      js: {
        files: {
          "<%= yeoman.dist %>/<%= yeoman.distFileName %>.js": onlySources,
        }
      },
      mocks:{
        files: {
          "<%= yeoman.dist %>/<%= yeoman.distFileName %>-mocks.js": onlyMocks
        }
      },
      everything: {
        files: {
          "<%= yeoman.dist %>/<%= yeoman.distFileName %>.js": onlySources,
          "<%= yeoman.dist %>/<%= yeoman.distFileName %>-mocks.js": onlyMocks
        }
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/<%= yeoman.distFileName %>.min.js': [
            '<%= yeoman.dist %>/<%= yeoman.distFileName %>.js'
          ]
        }
      }
    }


  });

  // Run this during development
  grunt.registerTask('dev', [
    'clean:js',
    'concat',
    'watch'
  ])

  grunt.registerTask('build-login', [
    'clean:all',
    'concat',
    'uglify'
  ]);

  grunt.registerTask('build', [
    'clean:all',
    'concat',
    'uglify'
  ]);


  grunt.registerTask('default', ['build']);
};
