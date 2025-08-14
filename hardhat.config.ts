import hardhatContractSizer from './src/index.js';
import type { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  plugins: [hardhatContractSizer],
};

export default config;
