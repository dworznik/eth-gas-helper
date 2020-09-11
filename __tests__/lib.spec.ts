import { mapObj, pick, tryNull, untilSuccess } from 'src/lib';

test('pick', async () => {
  const obj = { a: 1, b: 2, c: 3 };
  const ret = pick(obj, ['a']);
  expect(ret).toMatchObject({ a: 1 });
});

test('mapObj', async () => {
  const obj = { a: 1, b: 2, c: 3 };
  const ret = mapObj(obj, x => x + 1);
  expect(ret).toMatchObject({ a: 2, b: 3, c: 4 });
});

test('tryNull', async () => {
  const fn = () => Promise.reject('error');
  const ret = await tryNull(fn);
  expect(ret).toBeNull();
});

test('untilSuccess', async () => {
  const input = [
    jest.fn(() => Promise.reject(0)),
    jest.fn(() => Promise.resolve(12)),
    jest.fn(() => Promise.resolve(40))];
  const ret = await untilSuccess(input);
  expect(ret).toEqual(12);
  expect(input[0]).toBeCalledTimes(1);
  expect(input[1]).toBeCalledTimes(1);
  expect(input[2]).toBeCalledTimes(0);

});

test('untilSuccess null', async () => {
  const input = [
    jest.fn(() => Promise.reject(0)),
    jest.fn(() => Promise.reject(12)),
    jest.fn(() => Promise.reject(40))];
  const ret = await untilSuccess(input);
  expect(ret).toBeNull();
  expect(input[0]).toBeCalledTimes(1);
  expect(input[1]).toBeCalledTimes(1);
  expect(input[2]).toBeCalledTimes(1);
});

