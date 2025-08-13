import pkg from '../package.json' with { type: 'json' };
import taskContractSize from './tasks/contract_size.js';
import taskContractSizeDiff from './tasks/contract_size_diff.js';
import taskContractSizeList from './tasks/contract_size_list.js';
import './type_extensions.js';
import { globalOption } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: pkg.name,
  npmPackage: pkg.name,
  dependencies: () => [
    import('@solidstate/hardhat-solidstate-utils'),
    import('@solidstate/hardhat-git'),
  ],
  tasks: [taskContractSize, taskContractSizeList, taskContractSizeDiff],
  hookHandlers: {
    config: () => import('./hooks/config.js'),
    solidity: () => import('./hooks/solidity.js'),
  },
  globalOptions: [
    globalOption({
      name: 'noSizeContracts',
      description: 'Disables contract sizing',
      defaultValue: false,
      type: ArgumentType.BOOLEAN,
    }),
  ],
};

export default plugin;
