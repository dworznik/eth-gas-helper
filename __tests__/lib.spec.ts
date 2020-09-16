import {
  cacheFor,
  mapObj,
  pick,
  tryNull,
  untilSuccessOrNull,
  untilSuccessWithErrors,
  waitFor,
} from 'src/lib';
import { timeout } from '@helpers/timeout';

test('pick', async () => {
  const obj = { a: 1, b: 2, c: 3 };
  const ret = pick(obj, ['a']);
  expect(ret).toMatchObject({ a: 1 });
});

test('mapObj', async () => {
  const obj = { a: 1, b: 2, c: 3 };
  const ret = mapObj(obj, (k, x) => x + 1);
  expect(ret).toMatchObject({ a: 2, b: 3, c: 4 });
});

test('tryNull', async () => {
  const fn = () => Promise.reject('error');
  const ret = await tryNull(fn);
  expect(ret).toBeNull();
});

test('untilSuccessOrNull', async () => {
  const input = [
    jest.fn(() => Promise.reject(0)),
    jest.fn(() => Promise.resolve(12)),
    jest.fn(() => Promise.resolve(40))];
  const ret = await untilSuccessOrNull(input);
  expect(ret).toEqual(12);
  expect(input[0]).toBeCalledTimes(1);
  expect(input[1]).toBeCalledTimes(1);
  expect(input[2]).toBeCalledTimes(0);

});

test('untilSuccessOrNull null', async () => {
  const input = [
    jest.fn(() => Promise.reject(0)),
    jest.fn(() => Promise.reject(12)),
    jest.fn(() => Promise.reject(40))];
  const ret = await untilSuccessOrNull(input);
  expect(ret).toBeNull();
  expect(input[0]).toBeCalledTimes(1);
  expect(input[1]).toBeCalledTimes(1);
  expect(input[2]).toBeCalledTimes(1);
});


test('untilSuccessWithErrors', async () => {
  const input = [
    jest.fn(() => Promise.reject(new Error('foo'))),
    jest.fn(() => Promise.resolve(12)),
    jest.fn(() => Promise.resolve(40))];
  const ret = await untilSuccessWithErrors(input);
  expect(ret).toEqual({ value: 12, errors: [new Error('foo')] });
  expect(input[0]).toBeCalledTimes(1);
  expect(input[1]).toBeCalledTimes(1);
  expect(input[2]).toBeCalledTimes(0);

});

test('untilSuccessWithErrors all errors', async () => {
  const input = [
    jest.fn(() => Promise.reject(new Error('test'))),
    jest.fn(() => Promise.reject(new Error('foo'))),
    jest.fn(() => Promise.reject(new Error('bar')))];
  const ret = await untilSuccessWithErrors(input);
  expect(ret).toEqual({ value: undefined, errors: [new Error('test'), new Error('foo'), new Error('bar')] });
  expect(input[0]).toBeCalledTimes(1);
  expect(input[1]).toBeCalledTimes(1);
  expect(input[2]).toBeCalledTimes(1);
});

test('waitFor', async () => {
  const ret = await waitFor(500, () => timeout(100, 42))();
  expect(ret).toEqual(42);
});

test('waitFor timeout', async () => {
  await expect(() =>
    waitFor(500, async () =>
      timeout(1000, 42))()).rejects.toThrowError('Timeout');
});

test('cacheFor', async () => {
  const counter = (start: number) => {
    let count = start;
    return () => Promise.resolve(++count);
  };
  const mockFn = jest.fn(counter(0));
  const fn = async (x: number) => x + await mockFn();
  const cachedFn = cacheFor(500, fn);
  expect(await cachedFn(10)).toEqual(11);
  expect(mockFn.mock.calls.length).toBe(1);
  expect(await cachedFn(10)).toEqual(11);
  expect(mockFn.mock.calls.length).toBe(1);
  expect(await cachedFn(100)).toEqual(102);
  expect(mockFn.mock.calls.length).toBe(2);
  expect(await cachedFn(100)).toEqual(102);
  expect(mockFn.mock.calls.length).toBe(2);
  await timeout<void>(500);
  expect(await cachedFn(10)).toEqual(13);
  expect(mockFn.mock.calls.length).toBe(3);
  expect(await cachedFn(100)).toEqual(104);
  expect(mockFn.mock.calls.length).toBe(4);
});
