import fetch from 'isomorphic-fetch';
import { bn, idInc, pick } from 'src/lib';
import { GasPriceProvider, GasPrices } from 'src/provider/index';

export interface EthNodeData {
  result: string;
}

const getNextId = idInc();

export async function fetchEthNodeData(url: string): Promise<EthNodeData> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'eth_gasPrice', params: [], id: getNextId(), jsonrpc: '2.0' }),
  });
  const data = await res.json();
  return pick(data, ['result']);
}

export function convertEthNodeData(data: EthNodeData): GasPrices {
  const average = bn(data.result, 16);
  return {
    average,
    fast: average,
    fastest: average,
    safeLow: average,
  };
}

export function ethNodeProvider(apiKey: string): GasPriceProvider {
  return async () => convertEthNodeData(await fetchEthNodeData(apiKey));
}

