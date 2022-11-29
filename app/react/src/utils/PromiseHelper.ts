export function reducePromises<T>(promises: Array<Promise<T>>): Promise<T[]> {
  return promises.reduce((previousPromise, nextPromise) => {
    return previousPromise.then(previousResult => {
      return nextPromise.then(nextResult => previousResult.concat(nextResult));
    });
  }, Promise.resolve([] as T[]));
}

export type Task<T = any> = () => Promise<T>;

export function executeTasksInSequence(tasks: Task[]): Promise<any> {
  return tasks.reduce((previousTask, task) => {
    return previousTask.then(() => {
      return task();
    });
  }, Promise.resolve());
}
