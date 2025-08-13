import { TASK_CONTRACT_SIZE } from '../task_names.js';
import { emptyTask } from 'hardhat/config';

export default emptyTask(
  TASK_CONTRACT_SIZE,
  'Calculate contract sizes and compare against EVM limits',
).build();
