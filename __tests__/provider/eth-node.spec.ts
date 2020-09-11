import 'jest-extended';
import fetchMock from 'jest-fetch-mock';
import { ethNodeProvider } from 'src/provider';

beforeEach(() => {
  fetchMock.resetMocks();
});

test('eth node success', async () => {
  fetchMock.mockIf(/^https:\/\/ethnode.*$/,
    req => Promise.resolve({
      status: 200,
      body: '{"jsonrpc":"2.0","id":1,"result":"0x1f6ea08600"}',
    }));
  const data = await ethNodeProvider('https://ethnode')();
  expect(data).not.toBeNull();
  Object.values(data).forEach(x => expect(x.toNumber()).toEqual(135000000000));
});
