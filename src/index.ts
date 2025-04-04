import pkg from '../package.json';
import './type-extensions.js';
import { globalOption, task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const pluginName = pkg.name;

const plugin: HardhatPlugin = {
  id: pluginName.split('/').pop()!,
  npmPackage: pluginName!,
  tasks: [
    task('size-contracts')
      .setDescription('Output the size of compiled contracts')
      .setAction(import.meta.resolve('./tasks/size_contracts.js'))
      .addFlag({
        name: 'noCompile',
        description: "Don't compile before running this task",
      })
      .build(),
  ],
  hookHandlers: {
    config: import.meta.resolve('./hook_handlers/config.js'),
    solidity: import.meta.resolve('./hook_handlers/solidity.js'),
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
