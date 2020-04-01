/*jshint node:true */

// Generated on 2014-01-02 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

/**
 * Read the ivy credentials on jenkins and return the content as a hash.
 * That way we can push the generated zip file at the place as the other scala dist files.
 * @return {Object} the hash containing the credentials.
 */
function readIvyCredentials() {
  var fs = require("fs");
  var path = require("path");
  var properties = require("properties");

  var credsFile = path.join(process.env.HOME, ".ivy2", ".credentials");
  try {
    return properties.parse(fs.readFileSync(credsFile).toString());
  } catch (e) {
    return {};
  }
}

function setEnvironmentVariable(match, propertyName) {
  if (!process.env.NODE_ENV) { return match; }

  var fs = require("fs");
  var envFile = JSON.parse(fs.readFileSync('env.json'));
  var env = envFile[process.env.NODE_ENV][propertyName];
  return "'" + propertyName + "' : '" + env + "'";
}

module.exports = function (grunt) {

  var nexusCreds = readIvyCredentials();

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  grunt.loadNpmTasks('grunt-regex-replace');

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.loadNpmTasks('grunt-shell');

  grunt.loadNpmTasks('grunt-webpack');

  // var version = grunt.file.readJSON("package.json").version;
  var version = "1.0-build-" + (process.env.BUILD_NUMBER || "DEV") + "-rev-" + require('child_process').execSync("git rev-parse --short HEAD").toString().trim();

  var isSnapshot = version.indexOf("SNAPSHOT") !== -1;

  var betaArtifact = grunt.option('beta');

  var webpack = require('webpack');
  var webpackMiddleware = require("webpack-dev-middleware");
  var webpackDevConfig = require('./config/webpack.config.dev.js');
  var webpackProdConfig = require('./config/webpack.config.prod.js');
  var paths = require('./config/paths');

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: 'app',
      dist: 'dist'
    },

    compress: {
      main: {
        options: {
          archive: 'navigator.zip'
        },
        expand: true,
        src: ['**/*', '.tmp/**/*'],
        dest: './',
        cwd: 'dist',
        pretty: true
      }
    },

    nexusDeployer: {
      release: {
        options: {
          groupId: "com.mediarithmics.web",
          artifactId: betaArtifact ? "navigator-beta" : "navigator",
          version: version,
          packaging: 'zip',
          auth: {
            username: nexusCreds.user,
            password: nexusCreds.password
          },
          pomDir: 'generated/pom',
          url: 'https://' + nexusCreds.host + '/content/repositories/' + (isSnapshot ? 'snapshots' : 'releases'),
          artifact: 'navigator.zip'
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      compass: { 
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'], 
        tasks: ['compass:server', 'autoprefixer'] 
      },
      genRequireJsFiles: {
        files: ['/app/**/module.json'],
        tasks: ['genRequireJsFiles:config']
      },

      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['genRequireJsFiles:config']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729,
        middleware: function(connect, options, middlewares) {
          middlewares.unshift(webpackMiddleware(webpack(webpackDevConfig), { publicPath: paths.publicPath }));
          return middlewares;
        }
      },
      livereload: {
        options: {
          open: false,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              'navigator.zip',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },


    // Renames files for browser caching purposes
    filerev: {
      files: {
        src: [
          '<%= yeoman.dist %>/scripts/**/*.js',
          '<%= yeoman.dist %>/styles/**/*.css',
          '<%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: [
        '<%= yeoman.dist %>/*.html'
      ],
      css: ['<%= yeoman.dist %>/styles/**/*.css'],
      js: ['<%= yeoman.dist %>/scripts/*.js'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>'],
        root: '<%= yeoman.dist %>',
        patterns: {
          js: [
            [/(images\/.*?\.png)/g, 'Replacing reference to images/*.png']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '**/*.{png,jpg,jpeg,gif}',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: ['*.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },

    uglify: {
      options: {
        mangle: false,
        compress: true,
        sourceMap: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/scripts',
            src: '*.js',
            dest: '<%= yeoman.dist %>/scripts'
          }
        ]

      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'fonts/*'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= yeoman.dist %>/images',
            src: ['generated/*']
          },
          {
            expand: true,
            cwd: '.tmp',
            dest: '<%= yeoman.dist %>/.tmp',
            src: ['concat/**/*'] // add the "source" files used by uglify to generate the source map
          },
          {
            expand: true,
            dest: '<%= yeoman.dist %>/styles/font',
            src: '*'
          }
        ]
      },
      generated_iab: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              'images/flash/generated/*'
            ]
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    'regex-replace': {
      dist: {
        src: ['<%= yeoman.dist %>/index.html'],
        actions: [
          {
            name: 'requirejs-newpath',
            search: "window.mainRev='.*'",
            replace: function (match) {
              var regex = /window.mainRev=\'(.*)\'/;
              var result = regex.exec(match);
              var fileName = grunt && grunt.filerev && grunt.filerev.summary['dist/scripts/' + result[1]] ? grunt.filerev.summary['dist/scripts/' + result[1]] : '';
              var revFileName = fileName.replace('dist', '');
              return "window.mainRev='"+ revFileName +"'";
            }

          }
        ]
      },
      appConfig: {
        actions: [
          {
            name: 'WS_URL',
            search: "'WS_URL' : '.*'",
            replace: function (match) {
              return setEnvironmentVariable(match, "WS_URL");
            }
          },
          {
            name: 'ADS_UPLOAD_URL',
            search: "'ADS_UPLOAD_URL' : '.*'",
            replace: function (match) {
              return setEnvironmentVariable(match, "ADS_UPLOAD_URL");
            }
          }
        ]
      },
      reactConfig: {
        src: ['./app/conf/react-configuration.js'],
        actions: [
          {
            name: 'API_URL',
            search: "'API_URL' : '.*'",
            replace: function (match) {
              return setEnvironmentVariable(match, "API_URL");
            }
          }
        ]
      },
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    genRequireJsFiles: {
      config: {
        template: 'define([{{{requires}}}],function(){});',
      }
    },

    webpack: {
      build: webpackProdConfig
    }
  });

  grunt.registerTask('versionFile', function (target) {
    var path = require("path");
    var targetPathConfig = grunt.config('yeoman.' + target);
    grunt.file.write(path.join(targetPathConfig, "version.txt"), version);
    grunt.file.write(path.join(targetPathConfig, "version.json"), JSON.stringify({ version: version }));
  });

  grunt.registerMultiTask('genRequireJsFiles', function () {
    var fs = require('fs');
    var path = require('path');
    var Mustache = require('mustache');
    var _ = require('lodash');

    this.filesSrc.forEach(function (filepath) {
      var content = JSON.parse(fs.readFileSync(filepath));
      var dirname = path.dirname(filepath);
      var jsToInclude = _.without(_.filter(fs.readdirSync(dirname), function (val) {
        return val.match(/\.js$/);
      }).map(function (v) {
        return "./" + v.replace(/\.js$/g, '');
      }), "./index", "./module");

      content.requiresJs = content.dependencies.concat(jsToInclude);
      var models = {
        name: content.name,
        dependencies: _.map(content.dependencies, function (v) {
          return "\"" + v + "\"";
        }).join(","),
        requires: _.map(content.requiresJs, function (v) {
          if (!v.match(/\.js$/)) {
            if (v.match(/^core/)) {
              return "\"" + v + "/index\"";
            }
          }
          return "\"" + v + "\"";

        }).join(",")
      };

      var indexJs = Mustache.render(grunt.config("genRequireJsFiles.config.template"), models);
      var moduleJs = Mustache.render(grunt.config("genRequireJsFiles.config.templateModule"), models);

      fs.writeFileSync(dirname + "/index.js", indexJs);
      fs.writeFileSync(dirname + "/module.js", moduleJs);
    });
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'setEnvVariablesConfig',
      'clean:server',
      'jshint:all',
      'genRequireJsFiles:config',
      'concurrent:server',
      'connect:livereload',
      'versionFile:app',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('setEnvVariablesConfig', [
    'regex-replace:appConfig',
    'regex-replace:reactConfig'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'jshint:all',
    'genRequireJsFiles:config',
    'concurrent:test',
    'connect:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint:all',
    'useminPrepare',
    'genRequireJsFiles:config',
    'concurrent:dist',
    'copy:dist',
    'uglify',
    'filerev',
    'regex-replace:dist',
    'usemin',
    'copy:generated_iab',
    'webpack:build',
    'htmlmin',
    'versionFile:dist',
    'compress'
  ]);

  grunt.registerTask('publish', [
    'build',
    'nexusDeployer'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'build'
  ]);
};
