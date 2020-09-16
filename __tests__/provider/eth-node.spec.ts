import 'jest-extended';
import fetch from '@helpers/fetch';
import { ethNodeProvider, getEthNodeDataConverter } from 'provider';

beforeEach(() => {
  fetch.reset();
});

test('eth node success', async () => {
  fetch.mock(/^https:\/\/ethnode.*$/,
    req => Promise.resolve({
      status: 200,
      body: '{"jsonrpc":"2.0","id":1,"result":"0x1f6ea08600"}',
    }));
  const ret = await ethNodeProvider('https://ethnode', getEthNodeDataConverter())();
  expect(ret).not.toBeNull();
  expect(ret.data.average.toNumber()).toEqual(135000000000);
  expect(ret.data.safeLow.toNumber()).toEqual(135000000000);
  expect(ret.data.fast.toNumber()).toEqual(148500000000);
  expect(ret.data.fastest.toNumber()).toEqual(162000000000);
});
