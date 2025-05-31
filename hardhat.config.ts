import HardhatContractSizer from './src/index.js';
import type { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  plugins: [HardhatContractSizer],
};

export default config;
