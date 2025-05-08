import { task } from 'hardhat/config';

export default task('size-contracts-diff')
  .setDescription('Compare contract sizes across git references')
  .setAction(import.meta.resolve('../actions/size_contracts_diff.js'))
  .addVariadicArgument({
    name: 'refs',
    description: 'Git references to compare (up to two)',
    defaultValue: [],
  })
  .build();
