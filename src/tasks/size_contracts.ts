import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export default task('size-contracts')
  .setDescription('Output the size of compiled contracts')
  .setAction(import.meta.resolve('../actions/size_contracts.js'))
  .addOption({
    name: 'ref',
    description: 'Git reference where contracts are defined',
    defaultValue: undefined,
    type: ArgumentType.STRING_WITHOUT_DEFAULT,
  })
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .build();
