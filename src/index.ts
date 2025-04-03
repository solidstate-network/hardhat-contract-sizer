import packageJson from '../package.json';
import './type-extensions.js';
import { task } from 'hardhat/config';
import 'hardhat/types/config';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const pluginName = packageJson.name;

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
};

export default plugin;
