export const getPaginatedApiParam = (page = 1, pageSize = 500) => ({
  first_result: (page - 1) * pageSize,
  max_results: pageSize
});

export const takeLatest = functionReturningPromise => {
  let lastAdded = null;
  let pending = null;
  let resolve = null;
  let reject = null;

  const success = (promise, value) => {
    if (promise === lastAdded) {
      pending = null;
      resolve(value);
    }
  };

  const failure = (promise, error) => {
    if (promise === lastAdded) {
      pending = null;
      reject(error);
    }
  };

  return (...args) => {
    lastAdded = functionReturningPromise(...args);
    if (!pending) {
      pending = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
    }
    lastAdded.then(success.bind(null, lastAdded), failure.bind(null, lastAdded));
    return pending;
  };

};
