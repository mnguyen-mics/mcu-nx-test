const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');

const globSync = glob.sync;
const mkdirpSync = mkdirp.sync;
// import { sync as globSync } from 'glob';
// import { sync as mkdirpSync } from 'mkdirp';

const MESSAGES_PATTERN = './build/messages/**/*.json';
const LANG_DIR = './build/lang/';

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync(MESSAGES_PATTERN)
  .map(filename => fs.readFileSync(filename, 'utf8'))
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({ id, defaultMessage }) => {
      if (collection.hasOwnProperty(id)) {
        // eslint-disable-line
        throw new Error(`Duplicate message id: ${id}`);
      }

      collection[id] = defaultMessage; // eslint-disable-line
    });

    return collection;
  }, {});

mkdirpSync(LANG_DIR);
fs.writeFileSync(`${LANG_DIR}en-US.json`, JSON.stringify(defaultMessages, null, 2));
