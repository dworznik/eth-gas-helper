import BigNumber from 'bignumber.js';

export const pick = <T, K extends keyof T>(obj: T, ks: readonly K[]): Pick<T, K> =>
  ks.reduce((acc: Pick<T, K>, k: K) => {
    acc[k] = obj[k];
    return acc;
  }, {} as Pick<T, K>);

export const mapObj = <T, K extends keyof T, V extends Record<K, any>>(obj: T, fn: (x: any) => any) =>
  (Object.keys(obj) as Array<K>)
    .reduce((acc: V, k: K) => {
      acc[k] = fn(obj[k]);
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

export function untilSuccess<T>(tasks: (() => Promise<T | null>)[]): Promise<T | null> {
  return tasks.reduce<Promise<T | null>>(
    (prev: Promise<T | null>, cur: () => Promise<T | null>) =>
      prev.then(x => x ?? cur()).catch(_ => null),
    Promise.resolve(null),
  );
}

export function roundUp(val: BigNumber): BigNumber {
  return val.decimalPlaces(0, BigNumber.ROUND_UP);
}
