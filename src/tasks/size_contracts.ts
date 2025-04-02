import { task } from 'hardhat/config';

export default task('size-contracts')
  .setDescription('Output the size of compiled contracts')
  .setAction(import.meta.resolve('./task-action.js'))
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .build();
