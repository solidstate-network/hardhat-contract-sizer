import { TASK_SIZE_CONTRACTS_DIFF } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_SIZE_CONTRACTS_DIFF)
  .setDescription('Compare contract sizes across git revisions')
  .setAction(import.meta.resolve('../actions/size_contracts_diff.js'))
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
