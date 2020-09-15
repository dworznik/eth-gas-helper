import fetch from 'isomorphic-fetch';
import { bn, idInc, pick } from '../lib';
import { Factors, GasPrices, multiply } from 'src/provider/index';

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

const defaultMultipliers = {
  safeLow: 1,
  average: 1,
  fast: 1.1,
  fastest: 1.2,
};

export function getEthNodeDataConverter(multipliers: Factors = defaultMultipliers) {
  return (data: EthNodeData): GasPrices => {
    const average = bn(data.result, 16);
    return multiply(average, multipliers);
  };
}

export function ethNodeProvider(apiKey: string, converter: (data: EthNodeData) => GasPrices) {
  return async () => converter(await fetchEthNodeData(apiKey));
}

