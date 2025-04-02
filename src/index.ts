import './tasks/compile';
import './tasks/size_contracts';
import './type-extensions';
import { extendConfig } from 'hardhat/config';
import 'hardhat/types/config';
import type { HardhatPlugin } from 'hardhat/types/plugins';

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

const hardhatContractSizerPlugin: HardhatPlugin = {
  // TODO: read from package.json
  // id: pluginName.split('/').pop(),
  // npmPackage: pluginName,
  id: 'hardhat-contract-sizer',
  npmPackage: '@solidstate/hardhat-contract-sizer',
};

export default hardhatContractSizerPlugin;
