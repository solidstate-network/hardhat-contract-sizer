import {
  countOversizedContracts,
  loadContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { createHardhatRuntimeEnvironmentAtGitRef } from '@solidstate/hardhat-git';
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

  // TODO: npmInstall parameter

  if (args.ref) {
    hre = await createHardhatRuntimeEnvironmentAtGitRef(hre, args.ref);
  }

  if (!args.noCompile) {
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask(TASK_COMPILE).run();
  }

  const sizedContracts = await loadContractSizes(hre, hre.config.contractSizer);

  const oversizedCount = countOversizedContracts(sizedContracts);

  printContractSizes(sizedContracts, hre.config.contractSizer, oversizedCount);
};

export default action;
