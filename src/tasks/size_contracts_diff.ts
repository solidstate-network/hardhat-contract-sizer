import { TASK_SIZE_CONTRACTS_DIFF } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_SIZE_CONTRACTS_DIFF)
  .setDescription('Compare contract sizes across git references')
  .setAction(import.meta.resolve('../actions/size_contracts_diff.js'))
  .addPositionalArgument({
    name: 'refA',
    description: 'Previous reference to compare against',
    defaultValue: 'HEAD',
  })
  .addPositionalArgument({
    name: 'refB',
    description: 'Current git reference to compare',
    defaultValue: '',
  })
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .build();
