module.exports = function(grunt) {
  grunt.initConfig({

    run: {
      options: {
        // Task-specific options go here.
      },
      projectsApi: {
        cmd: 'node',
        args: [
          'server.js'
        ]
      },
      databaseSetup: {
        cmd: 'node',
        args: [
          './boot/createDB.js'
        ]
      },
      installVirtualenv: {
        cmd: 'pip',
        args: [
          'install',
          'virtualenv'
        ]
      },
      generateVirtualenv: {
        cmd: 'virtualenv',
        args: [
          './mq/mq'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-run');
  grunt.registerTask('startServer', ['run:installVirtualenv','run:generateVirtualenv','run:databaseSetup','run:projectsApi']);
}
