import {
  ethNodeProvider,
  gasPrice,
  GasPriceInfo,
  GasPriceProvider,
  gasStationProvider,
  getEthNodeDataConverter,
} from './provider';
import { TxData } from 'ethereum-types';
import { cacheFor, curry, untilSuccess, waitFor } from './lib';
import { GasPrice, TxSpeed } from './provider';

export { GasPrice, TxSpeed };

export interface GasHelperConfig {
  gasStationApiKey: string;
  nodeUrl: string;
  providerTimeout: number;
  cacheTimeout: number;
  gasPriceLimit: number;
}

export type GasPriceEstimator = (speed: TxSpeed) => Promise<GasPriceInfo>;

export type GasPriceSetter = {
  (speed: TxSpeed, tx: TxData): Promise<TxData>;
  (tx: TxData): Promise<TxData>;
};

const zero = gasPrice(0);

export function getGasPriceEstimator(...providers: GasPriceProvider[]): GasPriceEstimator {
  return async (speed: TxSpeed): Promise<GasPriceInfo> => {
    const info = await untilSuccess(providers.map((p: GasPriceProvider) => () => p()));
    return info ? { provider: info.provider, data: info.data[speed] } : { provider: 'dummy', data: zero };
  };
}

export function getProviders(config: GasHelperConfig): GasPriceProvider[] {
  const providers = [gasStationProvider(config.gasStationApiKey), ethNodeProvider(config.nodeUrl, getEthNodeDataConverter())];
  return providers.map(p => cacheFor(config.cacheTimeout, waitFor(config.providerTimeout, p)));
}

export const gasPriceEstimator = (config: GasHelperConfig) => getGasPriceEstimator(...getProviders(config));

export function getGasPriceSetter(estimate: GasPriceEstimator): GasPriceSetter {
  return curry(async (speed: TxSpeed, tx: TxData): Promise<TxData> => {
    const info = await estimate(speed);
    return { ...tx, gasPrice: info.data };
  });
}

export function gasPriceSetter(config: GasHelperConfig) {
  return getGasPriceSetter(gasPriceEstimator(config));
}
