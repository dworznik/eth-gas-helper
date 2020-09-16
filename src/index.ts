import {
  ethNodeProvider,
  GasPrice,
  GasPriceInfo,
  GasPriceProvider,
  gasStationProvider,
  getEthNodeDataConverter,
  TxSpeed,
} from './provider';
import { TxData } from 'ethereum-types';
import { cacheFor, curry, untilSuccessWithErrors, waitFor } from './lib';

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

export function getGasPriceEstimator(...providers: GasPriceProvider[]): GasPriceEstimator {
  return async (speed: TxSpeed): Promise<GasPriceInfo> => {
    const ret = await untilSuccessWithErrors(providers.map((p: GasPriceProvider) => () => p()));
    if (ret.value) {
      return { provider: ret.value.provider, data: ret.value.data[speed], errors: ret.errors };
    }
    throw new Error(ret.errors.reduce((str, x, idx) => str + (idx ? ', ' : '') + x.message, ''));
  };
}

export function getProviders(config: GasHelperConfig): GasPriceProvider[] {
  const providers = [gasStationProvider(config.gasStationApiKey), ethNodeProvider(config.nodeUrl, getEthNodeDataConverter())];
  return providers.map(p => cacheFor(config.cacheTimeout, waitFor(config.providerTimeout, p, 'Provider timeout')));
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
