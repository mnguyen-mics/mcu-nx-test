export function reducePromises<T>(promises: Array<Promise<T>>): Promise<T[]> {
  return promises.reduce((previousPromise, nextPromise) => {
    return previousPromise.then(previousResult => {
      return nextPromise.then(nextResult => previousResult.concat(nextResult));
    });
  }, Promise.resolve([] as T[]));
}