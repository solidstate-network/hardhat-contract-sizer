import { TASK_SIZE_CONTRACTS_DIFF } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_SIZE_CONTRACTS_DIFF)
  .setDescription('Compare contract sizes across git references')
  .setAction(import.meta.resolve('../actions/size_contracts_diff.js'))
  .addVariadicArgument({
    name: 'refs',
    description: 'Git references to compare (up to two)',
    defaultValue: [],
  })
  .build();
