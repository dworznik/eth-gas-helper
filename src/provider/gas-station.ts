import fetch from 'cross-fetch';
import { pick, mapObj } from 'src/lib';
import { GasPrices, gasPrice, TX_SPEEDS, GasPriceProvider } from './index';

const PROVIDER_NAME = 'ethgasstation';

export interface GasStationData {
  average: number;
  fast: number;
  fastest: number;
  safeLow: number;
}

export async function fetchGasStationData(apiKey: string): Promise<GasStationData> {
  const res = await fetch(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${apiKey}`);
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
  try {
    const data = await res.json();
    return pick(data, TX_SPEEDS);
  } catch (e) {
    throw new Error('Invalid server response: ' + e.message);
  }
}

export const convertGasStationData = (data: GasStationData): GasPrices =>
  mapObj(data, (k, x) => gasPrice(x).times(100000000));

export function gasStationProvider(apiKey: string): GasPriceProvider {
  return async () => ({ data: convertGasStationData(await fetchGasStationData(apiKey)), provider: PROVIDER_NAME });
}


