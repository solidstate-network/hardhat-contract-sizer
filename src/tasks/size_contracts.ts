import { sizeContracts } from '../logic.js';
import { NewTaskActionFunction } from 'hardhat/types/tasks';

export interface SizeContractsActionArguments {
  noCompile: boolean;
}

const action: NewTaskActionFunction<SizeContractsActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  if (!args.noCompile) {
    // TODO: will task names no longer be stored in constants?
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask('compile').run();
  }

  await sizeContracts(hre, hre.config.contractSizer);
};

export default action;
