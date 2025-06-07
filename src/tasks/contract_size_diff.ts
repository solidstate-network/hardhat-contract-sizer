import { TASK_CONTRACT_SIZE_DIFF } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_CONTRACT_SIZE_DIFF)
  .setDescription('Compare contract sizes across git revisions')
  .setAction(import.meta.resolve('../actions/contract_size_diff.js'))
  .addPositionalArgument({
    name: 'revA',
    description: 'Previous revision to compare against',
    defaultValue: 'HEAD',
  })
  .addPositionalArgument({
    name: 'revB',
    description: 'Current git revision to compare',
    defaultValue: '',
  })
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .build();
