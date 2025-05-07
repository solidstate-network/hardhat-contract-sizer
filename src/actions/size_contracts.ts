import {
  countOversizedContracts,
  sizeContracts,
} from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
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

  const sizedContracts = await sizeContracts(hre, hre.config.contractSizer);

  const oversizedCount = countOversizedContracts(sizedContracts);

  printContractSizes(sizedContracts, hre.config.contractSizer, oversizedCount);
};

export default action;
