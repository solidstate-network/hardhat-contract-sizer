import {
  HardhatContractSizerConfig,
  HardhatContractSizerUserConfig,
} from '../types.js';

const DEFAULT_CONFIG: HardhatContractSizerConfig = {
  alphaSort: false,
  runOnCompile: false,
  flat: false,
  strict: false,
  only: [],
  except: [],
  outputFile: undefined,
  unit: 'KiB',
};

export function getConfig(
  userConfig: HardhatContractSizerUserConfig | undefined,
): HardhatContractSizerConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };
}
