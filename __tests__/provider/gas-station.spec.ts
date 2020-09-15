import { gasStationProvider } from 'src/provider/gas-station';
import 'jest-extended';
import fetch from '@helpers/fetch';

beforeEach(() => {
  fetch.reset();
});

test('gas station success', async () => {
  fetch.mock(/^https:\/\/ethgasstation\.info\/api\/ethgasAPI\.json\?api-key=.*$/,
    req => Promise.resolve({
      status: 200,
      body: '{"fast":910,"fastest":1000,"safeLow":820,"average":890,"block_time":14.5,"blockNum":10847268,"speed":0.8971149948865037,"safeLowWait":14.4,"avgWait":3.5,"fastWait":0.5,"fastestWait":0.5,"gasPriceRange":{"4":241.7,"6":241.7,"8":241.7,"10":241.7,"20":241.7,"30":241.7,"40":241.7,"50":241.7,"60":241.7,"70":241.7,"80":241.7,"90":241.7,"100":241.7,"110":241.7,"120":241.7,"130":241.7,"140":241.7,"150":241.7,"160":241.7,"170":241.7,"180":241.7,"190":241.7,"200":241.7,"220":241.7,"240":241.7,"260":241.7,"280":241.7,"300":241.7,"320":241.7,"340":241.7,"360":241.7,"380":241.7,"400":241.7,"420":241.7,"440":241.7,"460":241.7,"480":241.7,"500":241.7,"520":241.7,"540":241.7,"560":241.7,"580":241.7,"600":241.7,"620":241.7,"640":241.7,"660":241.7,"680":241.7,"700":241.7,"720":241.7,"740":241.7,"760":241.7,"780":241.7,"800":241.7,"820":14.4,"840":6,"860":4.8,"880":4.1,"890":3.5,"900":1.1,"910":0.5,"920":0.5,"940":0.5,"960":0.5,"980":0.5,"1000":0.5}}',
    }));
  const data = await gasStationProvider('ffff')();
  expect(data).not.toBeNull();
  Object.values(data!).forEach(x => expect(x.toNumber()).toBeNumber());
});

test('gas station auth error', async () => {
  fetch.mock(/^https:\/\/ethgasstation\.info\/api\/ethgasAPI\.json\?api-key=.*$/,
    req => Promise.resolve({
      status: 401,
    }));
  await expect(async () => {
    await gasStationProvider('ffff')();
  }).rejects.toThrowError('Unauthorized');
});

test('gas station server error', async () => {
  fetch.mock(/^https:\/\/ethgasstation\.info\/api\/ethgasAPI\.json\?api-key=.*$/,
    req => Promise.resolve({
      status: 500,
      body: 'internal server error',
    }));
  await expect(async () => {
    await gasStationProvider('ffff')();
  }).rejects.toThrowError('Internal Server Error');
});

test('gas station invalid response json', async () => {
  fetch.mock(/^https:\/\/ethgasstation\.info\/api\/ethgasAPI\.json\?api-key=.*$/,
    req => Promise.resolve({
      status: 200,
      body: 'internal server error',
    }));
  await expect(async () => {
    await gasStationProvider('ffff')();
  }).rejects.toThrowError(/^Invalid server response:.*$/);
});
