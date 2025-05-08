import {
  countOversizedContracts,
  getTmpHreAtGitRef,
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

  if (args.ref) {
    hre = await getTmpHreAtGitRef(hre, args.ref);
  }

  if (!args.noCompile) {
    await hre.tasks.getTask(TASK_COMPILE).run();
  }

  const sizedContracts = await loadContractSizes(hre, hre.config.contractSizer);

  const oversizedCount = countOversizedContracts(sizedContracts);

  printContractSizes(sizedContracts, hre.config.contractSizer, oversizedCount);
};

export default action;
