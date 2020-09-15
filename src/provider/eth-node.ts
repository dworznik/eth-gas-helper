import fetch from 'isomorphic-fetch';
import { bn, idInc, pick } from '../lib';
import { Factors, GasPriceProvider, GasPrices, multiply } from 'src/provider/index';

const PROVIDER_NAME = 'eth-node';

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
  safeLow: bn(1),
  average: bn(1),
  fast: bn(1.1),
  fastest: bn(1.2),
};

export function getEthNodeDataConverter(multipliers: Factors = defaultMultipliers) {
  return (data: EthNodeData): GasPrices => {
    const average = bn(data.result, 16);
    return multiply(average, multipliers);
  };
}

export function ethNodeProvider(apiKey: string, converter: (data: EthNodeData) => GasPrices): GasPriceProvider {
  return async () => ({ data: converter(await fetchEthNodeData(apiKey)), provider: PROVIDER_NAME });
}

