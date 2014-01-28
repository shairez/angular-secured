
module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

	var onlyMocks = '<%= yeoman.app %>/scripts/**/*.mock.js',
		onlySources = ['<%= yeoman.app %>/scripts/**/*.js',
						'!' + onlyMocks,
						'!<%= yeoman.app %>/scripts/**/*.test.js'];

	grunt.initConfig({
		yeoman: {
			app: 'src',
			dist: 'dist',
			distFileName: 'angular-security'
		},

		clean: {
			js: ["<%= yeoman.dist %>/*.js",
				"!<%= yeoman.dist %>/*.min.js"],
			all: ["<%= yeoman.dist %>"]
		},
		watch: {
			js: {
				files: onlySources,
				tasks: ['concat:js']
			},
			mocks: {
				files: ['<%= yeoman.app %>/scripts/**/*.mock.js'],
				tasks: ['concat:mocks']
			}
		},

		concat: {
			js: {
				files:{
					"<%= yeoman.dist %>/<%= yeoman.distFileName %>.js": onlySources
				}
			},
			mocks: {
				files:{
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

	grunt.registerTask('build', [
		'clean:all',
		'concat',
		'uglify'
	]);


	grunt.registerTask('default', ['build']);
};
