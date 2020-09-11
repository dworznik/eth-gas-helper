import { BigNumber } from 'bignumber.js';

export * from './gas-station';
export * from './eth-node';

export type GasPrice = BigNumber;
export const gasPrice = (val: number | string) => new BigNumber(val);

export type TxSpeed = 'safeLow' | 'average' | 'fast' | 'fastest';
export const TX_SPEEDS: TxSpeed[] = ['safeLow', 'average', 'fast', 'fastest'];

export interface GasPrices {
  average: GasPrice;
  fast: GasPrice;
  fastest: GasPrice;
  safeLow: GasPrice;
}

export type GasPriceProvider = () => Promise<GasPrices>;

