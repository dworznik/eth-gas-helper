export const timeout = <T>(millis: number, val?: T): Promise<T> => new Promise((res, rej) => {
  setTimeout(() => res(val), millis);
});
