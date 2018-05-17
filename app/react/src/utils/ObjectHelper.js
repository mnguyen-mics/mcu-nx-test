const customBlackList = ['intl'];

function copyToDepthHelper(obj, res, seen) {
  if (obj !== null && obj !== undefined) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object') {
        if (seen.indexOf(obj[key]) === -1 &&
          customBlackList.indexOf(key) === -1 &&
          key.charAt(0) !== '_') {
          res[key] = {};
          seen.push(obj[key]);
          res[key] = copyToDepthHelper(obj[key], res[key], seen);
        } else {
          res[key] = '-seen-';
        }
      } else {
        res[key] = obj[key];
      }
    });
  }
  return res;
}

function copyToDepth(obj) {
  const res = {};
  const seen = [];
  return copyToDepthHelper(obj, res, seen);
}

export default copyToDepth;
