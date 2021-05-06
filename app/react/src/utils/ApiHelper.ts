export interface PaginatedApiParam {
  first_result?: number;
  max_results?: number;
}

export function getPaginatedApiParam(
  page: number = 1,
  pageSize: number = 500,
): {
  first_result: number;
  max_results: number;
} {
  return {
    first_result: (page - 1) * pageSize,
    max_results: pageSize,
  };
}

type PromiseFactory<T> = (...args: any[]) => Promise<T>;

/*
  example usage: declare before your class const myService = takeLatest(ReportService.myService)
  and use myService within your class to fetch the latest myService call
*/

export function takeLatest<T>(promiseFactory: PromiseFactory<T>): PromiseFactory<T> {
  let lastAdded: Promise<T>;
  let pending: Promise<T> | null;

  let resolve: (value?: T | PromiseLike<T> | undefined) => void;
  let reject: (reason?: any) => void;

  const success = (promise: Promise<T>, value: T) => {
    if (promise === lastAdded) {
      pending = null;
      resolve(value);
    }
  };

  const failure = (promise: Promise<T>, error: any) => {
    if (promise === lastAdded) {
      pending = null;
      reject(error);
    }
  };

  return (...args: any[]) => {
    lastAdded = promiseFactory(...args);
    if (!pending) {
      pending = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
    }
    lastAdded.then(success.bind(null, lastAdded), failure.bind(null, lastAdded));
    return pending;
  };
}

export interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

export function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
  let hasCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      val => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
      error => (hasCanceled ? reject({ isCanceled: true }) : reject(error)),
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}
