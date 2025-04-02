import './tasks/compile';
import './tasks/size_contracts';
import sizeContractsTask from './tasks/size_contracts.js';
import './type-extensions';
import 'hardhat/types/config';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const hardhatContractSizerPlugin: HardhatPlugin = {
  // TODO: read from package.json
  // id: pluginName.split('/').pop(),
  // npmPackage: pluginName,
  id: 'hardhat-contract-sizer',
  npmPackage: '@solidstate/hardhat-contract-sizer',
  tasks: [sizeContractsTask],
  hookHandlers: {
    solidity: import.meta.resolve('./hook_handlers/solidity.js'),
  },
};

export default hardhatContractSizerPlugin;
