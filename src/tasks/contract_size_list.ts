import { TASK_CONTRACT_SIZE_LIST } from '../task_names.js';
import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export default task(TASK_CONTRACT_SIZE_LIST)
  .setDescription('Output the size of compiled contracts')
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
  .setAction(() => import('../actions/contract_size_list.js'))
  .build();
