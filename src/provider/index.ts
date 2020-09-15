import { BigNumber } from 'bignumber.js';
import { mapObj } from 'src/lib';

export * from './gas-station';
export * from './eth-node';

export type GasPrice = BigNumber;
export const gasPrice = (val: number | string) => new BigNumber(val);

export type TxSpeed = 'safeLow' | 'average' | 'fast' | 'fastest';
export const TX_SPEEDS: TxSpeed[] = ['safeLow', 'average', 'fast', 'fastest'];
export type GasPrices = { [key in TxSpeed]: GasPrice };
export type Factors = { [key in TxSpeed]: number };

export type GasPriceProvider = () => Promise<GasPrices>;

export const multiply = (val: BigNumber, factors: Factors): GasPrices =>
  mapObj(factors, x => val.times(x));

