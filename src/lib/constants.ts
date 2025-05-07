import type { HardhatContractSizerConfig } from '../types.js';

// see EIPs 170 and 3860 for more information
// https://eips.ethereum.org/EIPS/eip-170
// https://eips.ethereum.org/EIPS/eip-3860
export const DEPLOYED_SIZE_LIMIT = 24576;
export const INIT_SIZE_LIMIT = 49152;

export const UNITS: { [key in HardhatContractSizerConfig['unit']]: number } = {
  B: 1,
  kB: 1000,
  KiB: 1024,
};
