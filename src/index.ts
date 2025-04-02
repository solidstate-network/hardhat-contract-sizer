import './tasks/compile';
import './tasks/size_contracts';
import { extendConfig } from 'hardhat/config';
import 'hardhat/types/config';

interface HardhatContractSizerConfig {
  alphaSort: boolean;
  runOnCompile: boolean;
  flat: boolean;
  strict: boolean;
  only: string[];
  except: string[];
  outputFile: string;
  unit: 'B' | 'kB' | 'KiB';
}

type HardhatContractSizerUserConfig = Partial<HardhatContractSizerConfig>;

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    contractSizer?: HardhatContractSizerUserConfig;
  }

  interface HardhatConfig {
    contractSizer: HardhatContractSizerConfig;
  }
}

extendConfig((config, userConfig) => {
  config.contractSizer = Object.assign(
    {
      alphaSort: false,
      runOnCompile: false,
      flat: false,
      strict: false,
      only: [],
      except: [],
      outputFile: null,
      unit: 'KiB',
    },
    userConfig.contractSizer,
  );
});
