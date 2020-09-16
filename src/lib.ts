import BigNumber from 'bignumber.js';

export const pick = <T, K extends keyof T>(obj: T, ks: readonly K[]): Pick<T, K> =>
  ks.reduce((acc: Pick<T, K>, k: K) => {
    acc[k] = obj[k];
    return acc;
  }, {} as Pick<T, K>);

export const mapObj = <T, K extends keyof T, V extends Record<K, any>>(obj: T, fn: (k: K, x: any) => any) =>
  (Object.keys(obj) as Array<K>)
    .reduce((acc: V, k: K) => {
      acc[k] = fn(k, obj[k]);
      return acc;
    }, {} as V);

export function idInc() {
  let id = 1;
  return () => `${id++}`;
}

export const bn = (val: string | number, base?: number) => new BigNumber(val, base);

export function curry(fn: (...args: any[]) => any) {
  const argN = fn.length;
  return function(...args: any[]) {
    if (args.length < argN) {
      // @ts-expect-error: Ignore no implicit this
      return curry(fn.bind(this, ...args));
    }
    // @ts-expect-error: Ignore no implicit this
    return fn.call(this, ...args);
  };
}

export function tryNull<E, T>(fn: () => Promise<T>): Promise<T | null> {
  return fn().catch(_ => null);
}

export function untilSuccessOrNull<T>(tasks: (() => Promise<T | null>)[]): Promise<T | null> {
  return tasks.reduce<Promise<T | null>>(
    (prev: Promise<T | null>, cur: () => Promise<T | null>) =>
      prev.then(x => x ?? cur()).catch(_ => null),
    Promise.resolve(null),
  );
}

type PromiseErrors<T> = Promise<{ value?: T, errors: Error[] }>;

export function wrapErrors<T>(fn: () => Promise<T>, errs: Error[]): () => PromiseErrors<T> {
  return () => fn().then(value => ({ value, errors: [...errs] })).catch(err => ({ errors: [...errs, err] }));
}

export function untilSuccessWithErrors<T>(tasks: (() => Promise<T>)[]): PromiseErrors<T> {
  return tasks.reduce<PromiseErrors<T>>(
    (prev: PromiseErrors<T>, cur: () => Promise<T>) =>
      prev.then(({ value, errors }) => value ? { value, errors } : wrapErrors(cur, errors)()),
    Promise.resolve({ errors: [] }),
  );
}

export function roundUp2(val: BigNumber): BigNumber {
  return val.decimalPlaces(2, BigNumber.ROUND_UP);
}

export function waitFor<T, A extends any[] | any[]>(millis: number, fn: (...a: A) => Promise<T>, reason = 'Timeout'): (...args: A) => Promise<T> {
  return async function(...args: A) {
    return Promise.race([fn(...args), new Promise<T>((res, rej) => {
      setTimeout(() => rej(new Error(reason)), millis);
    })]);
  };
}

export function cacheFor<T, A extends any[] | any[]>(millis: number, fn: (...a: A) => Promise<T>): (...args: A) => Promise<T> {
  const cache = new Map();
  return async function(...args: A) {
    const k = args.join('#');
    if (cache.has(k)) {
      return Promise.resolve(cache.get(k));
    }
    const ret = await fn(...args);
    cache.set(k, ret);
    setTimeout(() => {
      cache.delete(k);
    }, millis);
    return ret;
  };
}
