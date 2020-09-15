import 'jest-extended';
import fetch from '@helpers/fetch';
import { ethNodeProvider, getEthNodeDataConverter } from 'src/provider';

beforeEach(() => {
  fetch.reset();
});

test('eth node success', async () => {
  fetch.mock(/^https:\/\/ethnode.*$/,
    req => Promise.resolve({
      status: 200,
      body: '{"jsonrpc":"2.0","id":1,"result":"0x1f6ea08600"}',
    }));
  const data = await ethNodeProvider('https://ethnode', getEthNodeDataConverter())();
  expect(data).not.toBeNull();
  expect(data.average.toNumber()).toEqual(135000000000);
  expect(data.safeLow.toNumber()).toEqual(135000000000);
  expect(data.fast.toNumber()).toEqual(148500000000);
  expect(data.fastest.toNumber()).toEqual(162000000000);
});
