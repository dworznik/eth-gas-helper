import { ethNodeProvider, gasPrice, GasPriceProvider, gasStationProvider, getEthNodeDataConverter } from './provider';
import { TxData } from 'ethereum-types';
import { curry, untilSuccess } from './lib';
import { GasPrice, TxSpeed } from './provider';


export { GasPrice, TxSpeed };

export interface GasHelperConfig {
  gasStationApiKey: string;
  nodeUrl: string;
}

export type GasPriceEstimator = (speed: TxSpeed) => Promise<GasPrice>;

export type GasPriceSetter = {
  (speed: TxSpeed, tx: TxData): Promise<TxData>;
  (tx: TxData): Promise<TxData>;
};

const zero = gasPrice(0);

export function getGasPriceEstimator(...providers: GasPriceProvider[]): GasPriceEstimator {
  return async (speed: TxSpeed): Promise<GasPrice> => {
    const prices = await untilSuccess(providers.map((p: GasPriceProvider) => () => p()));
    return prices ? prices[speed] : zero;
  };
}

export function getProviders(config: GasHelperConfig): GasPriceProvider[] {
  return [gasStationProvider(config.gasStationApiKey), ethNodeProvider(config.nodeUrl, getEthNodeDataConverter())];
}

export const gasPriceEstimator = (config: GasHelperConfig) => getGasPriceEstimator(...getProviders(config));

export function getGasPriceSetter(estimate: GasPriceEstimator): GasPriceSetter {
  return curry(async (speed: TxSpeed, tx: TxData): Promise<TxData> => {
    const price = await estimate(speed);
    return { ...tx, gasPrice: price };
  });
}

export function gasPriceSetter(config: GasHelperConfig) {
  return getGasPriceSetter(gasPriceEstimator(config));
}
