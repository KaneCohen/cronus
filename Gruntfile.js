module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			target: {
				files: {
					'lib/charon.min.js': 'lib/charon.js'
				},
				options: {
					mangle: true,
					compress: {
						dead_code: false
					},
					output: {
						ascii_only: true
					},
					report: 'min',
					preserveComments: 'some'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);
};
