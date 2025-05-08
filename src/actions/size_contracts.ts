import {
  countOversizedContracts,
  loadContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref?: string;
  noCompile: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  if (!args.noCompile) {
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask(TASK_COMPILE).run();
  }

  // TODO: ref is not compatible with --no-compile option

  const sizedContracts = await loadContractSizes(
    hre,
    hre.config.contractSizer,
    args.ref,
  );

  const oversizedCount = countOversizedContracts(sizedContracts);

  printContractSizes(sizedContracts, hre.config.contractSizer, oversizedCount);
};

export default action;
