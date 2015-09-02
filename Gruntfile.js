module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  var adaptersFolder = '<%= yeoman.app %>/adapters';
  var loopbackFolder = adaptersFolder + '/loopback';
  var onlyMocks = '<%= yeoman.app %>/**/*.mock.js';
  var onlySources = ['<%= yeoman.app %>/**/*.mdl.js',
                     '<%= yeoman.app %>/**/*.js',
                     '!' + onlyMocks,
                     '!<%= yeoman.app %>/**/*.spec.js',
                     '!' + adaptersFolder + '/**/*.js'
  ];

  var loopbackMocks = loopbackFolder + '/**/*.mock.js';
  var loopbackSources = [loopbackFolder + '/*.mdl.js',
                         loopbackFolder + '/**/*.js',
                         '!' + loopbackMocks,
                         '!' + loopbackFolder + '/**/*.spec.js'
  ];


  grunt.initConfig({
    yeoman: {
      app: 'src',
      tmp: '.tmp',
      dist: 'dist',
      distFileName: 'angular-secured',
      loopbackDistFileName: 'angular-secured-loopback'
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
        files: onlySources.concat(loopbackSources),
        tasks: ['concat:js']
      },
      mocks: {
        files: ['<%= yeoman.app %>/**/*.mock.js'],
        tasks: ['concat:mocks']
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      js: {
        files: {
          "<%= yeoman.dist %>/<%= yeoman.distFileName %>.js": onlySources,
          "<%= yeoman.dist %>/<%= yeoman.loopbackDistFileName %>.js": loopbackSources
        }
      },
      mocks: {
        files: {
          "<%= yeoman.dist %>/<%= yeoman.distFileName %>-mocks.js": onlyMocks,
          "<%= yeoman.dist %>/<%= yeoman.loopbackDistFileName %>-mocks.js": loopbackMocks
        }
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/<%= yeoman.distFileName %>.min.js': [
            '<%= yeoman.dist %>/<%= yeoman.distFileName %>.js'
          ],
          '<%= yeoman.dist %>/<%= yeoman.loopbackDistFileName %>.min.js': [
            '<%= yeoman.dist %>/<%= yeoman.loopbackDistFileName %>.js'
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
  ]);

  grunt.registerTask('build', [
    'clean:all',
    'concat',
    'uglify'
  ]);


  grunt.registerTask('default', ['build']);
};
