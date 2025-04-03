import { HardhatContractSizerConfig } from '../types.js';

const config: HardhatContractSizerConfig = {
  alphaSort: false,
  runOnCompile: false,
  flat: false,
  strict: false,
  only: [],
  except: [],
  outputFile: undefined,
  unit: 'KiB',
};

export default config;
