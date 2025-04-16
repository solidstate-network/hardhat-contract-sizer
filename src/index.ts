import pkg from '../package.json';
import './type-extensions.js';
import { globalOption, task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: pkg.name.split('/').pop()!,
  npmPackage: pkg.name!,
  tasks: [
    task('size-contracts')
      .setDescription('Output the size of compiled contracts')
      .setAction(import.meta.resolve('./actions/size_contracts.js'))
      .addFlag({
        name: 'noCompile',
        description: "Don't compile before running this task",
      })
      .build(),
  ],
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
