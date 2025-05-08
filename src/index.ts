import pkg from '../package.json';
import taskSizeContracts from './tasks/size_contracts.js';
import taskSizeContractsDiff from './tasks/size_contracts_diff.js';
import './type_extensions.js';
import { globalOption } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: pkg.name!,
  npmPackage: pkg.name!,
  tasks: [taskSizeContracts, taskSizeContractsDiff],
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
