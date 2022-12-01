/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
// Let's keep this script for now,
// we might need it to compare keys in the language files
const baseDir = path.join(process.cwd(), '/build/lang');

const files = {};

const compareKeys = (currentLang, otherLang) => {
  const currentLangData = JSON.parse(currentLang.data);
  const currentLangKeys = Object.keys(currentLangData);

  const otherLangKey = otherLang.key;
  const otherLangData = JSON.parse(otherLang.data);
  const otherLangKeys = Object.keys(otherLangData);

  files[otherLangKey] = [];

  currentLangKeys.forEach(key => {
    if (otherLangKeys.indexOf(key) === -1) {
      files[otherLangKey].push(key);
    }
  });

  const size = files[otherLangKey].length;

  if (size) {
    console.log(`${size} missing ${size > 1 ? 'keys' : 'key'} in ${otherLangKey}:`);
    console.log('');
    files[otherLangKey].map(key => console.log(key));
  } else {
    console.log(`No missing key in ${otherLangKey}`);
  }

  console.log('\n');

  return size;
};

const compareWithOtherLang = (currentLang, otherLang) => {
  return compareKeys(
    {
      key: currentLang,
      data: fs.readFileSync(path.join(baseDir, currentLang)),
    },
    {
      key: otherLang,
      data: fs.readFileSync(path.join(baseDir, otherLang)),
    },
  );
};

const processFile = (dir, currentFile) => {
  console.log('===================================================================');
  console.log('\n');
  console.log(`Comparison of ${currentFile} with other files`);
  console.log('\n');

  return fs
    .readdirSync(dir)
    .filter(file => !file.includes(currentFile))
    .map(otherLang => compareWithOtherLang(currentFile, otherLang))
    .reduce((acc, curr) => acc + curr);
};

const check = dir => {
  return fs
    .readdirSync(dir)
    .map(file => processFile(dir, file))
    .reduce((acc, curr) => acc + curr);
};

const numberOfDiff = check(baseDir);

if (numberOfDiff === 0) {
  process.exit(0);
} else {
  process.exit(1);
}
