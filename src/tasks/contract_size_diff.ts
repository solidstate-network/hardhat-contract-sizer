import { TASK_CONTRACT_SIZE_DIFF } from '../task_names.js';
import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export default task(TASK_CONTRACT_SIZE_DIFF)
  .setDescription('Compare contract sizes across git revisions')
  .addPositionalArgument({
    name: 'revA',
    description: 'Previous revision to compare against',
    defaultValue: 'HEAD',
  })
  .addPositionalArgument({
    name: 'revB',
    description: 'Current git revision to compare',
    type: ArgumentType.STRING_WITHOUT_DEFAULT,
  })
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .setAction(() => import('../actions/contract_size_diff.js'))
  .build();
