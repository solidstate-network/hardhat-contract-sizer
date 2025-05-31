import { TASK_SIZE_CONTRACTS } from '../task_names.js';
import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export default task(TASK_SIZE_CONTRACTS)
  .setDescription('Output the size of compiled contracts')
  .setAction(import.meta.resolve('../actions/size_contracts.js'))
  .addOption({
    name: 'rev',
    description: 'Git revision where contracts are defined',
    defaultValue: undefined,
    type: ArgumentType.STRING_WITHOUT_DEFAULT,
  })
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .build();
