export const getPaginatedApiParam = (page = 1, pageSize = 500) => ({
  first_result: (page - 1) * pageSize,
  max_results: pageSize,
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

export const makeCancelable = (promise) => {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled ? reject({ isCanceled: true }) : resolve(val), // eslint-disable-line no-confusing-arrow
      error => hasCanceled ? reject({ isCanceled: true }) : reject(error) // eslint-disable-line no-confusing-arrow
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
};
