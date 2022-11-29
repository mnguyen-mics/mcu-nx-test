const fs = require('fs');

class VersionPlugin {
  constructor(options = {}) {
    if (!options.path) throw Error("Missing 'path' option for VersionPlugin");
    this.path = options.path;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('VersionPlugin', (compilation, callback) => {
      console.log('Creating version files...');

      let version =
        '1.0-build-' +
        (process.env.BUILD_NUMBER || 'DEV') +
        '-rev-' +
        require('child_process').execSync('git rev-parse --short HEAD').toString().trim();

      fs.writeFile(this.path + '/version.txt', version, error => {
        if (error) throw error;
        console.log('version.txt created successfully !');
      });
      fs.writeFile(this.path + '/version.json', JSON.stringify({ version: version }), error => {
        if (error) throw error;
        console.log('version.json created successfully !');
      });

      callback();
    });
  }
}

module.exports = VersionPlugin;
