import type {
  HardhatContractSizerConfig,
  HardhatContractSizerUserConfig,
} from './types.js';

declare module 'hardhat/types/config' {
  interface HardhatConfig {
    contractSizer: HardhatContractSizerConfig;
  }

  interface HardhatUserConfig {
    contractSizer?: HardhatContractSizerUserConfig;
  }
}

declare module 'hardhat/types/global-options' {
  interface GlobalOptions {
    noSizeContracts: boolean;
  }
}
