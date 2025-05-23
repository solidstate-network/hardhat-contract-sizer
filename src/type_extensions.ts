import type { ContractSizerConfig, ContractSizerUserConfig } from './types.js';

declare module 'hardhat/types/config' {
  interface HardhatConfig {
    contractSizer: ContractSizerConfig;
  }

  interface HardhatUserConfig {
    contractSizer?: ContractSizerUserConfig;
  }
}

declare module 'hardhat/types/global-options' {
  interface GlobalOptions {
    noSizeContracts: boolean;
  }
}
