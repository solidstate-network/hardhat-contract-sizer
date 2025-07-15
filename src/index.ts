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
  dependencies: [
    async () => (await import('@solidstate/hardhat-solidstate-utils')).default,
    async () => (await import('@solidstate/hardhat-git')).default,
  ],
  tasks: [taskContractSize, taskContractSizeList, taskContractSizeDiff],
  hookHandlers: {
    config: import.meta.resolve('./hooks/config.js'),
    solidity: import.meta.resolve('./hooks/solidity.js'),
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
