import { loadContractSizes } from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { createHardhatRuntimeEnvironmentAtGitRev } from '@solidstate/hardhat-git';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  rev?: string;
  noCompile: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  if (args.rev) {
    hre = await createHardhatRuntimeEnvironmentAtGitRev(hre.config, args.rev);
  }

  if (!args.noCompile) {
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask(TASK_COMPILE).run();
  }

  const contractSizes = await loadContractSizes(hre, hre.config.contractSizer);

  printContractSizes(contractSizes, hre.config.contractSizer);
};

export default action;
