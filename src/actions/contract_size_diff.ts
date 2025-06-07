import {
  loadContractSizes,
  mergeContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizesDiff } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { createHardhatRuntimeEnvironmentAtGitRev } from '@solidstate/hardhat-git';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  revA: string;
  revB: string;
  noCompile: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  const hreRevA = await createHardhatRuntimeEnvironmentAtGitRev(
    hre.config,
    args.revA,
  );

  const hreRevB = args.revB
    ? await createHardhatRuntimeEnvironmentAtGitRev(hre.config, args.revB)
    : hre;

  if (!args.noCompile) {
    await hreRevA.tasks.getTask(TASK_COMPILE).run();
    await hreRevB.tasks.getTask(TASK_COMPILE).run();
  }

  const contractSizesA = await loadContractSizes(hre, hre.config.contractSizer);

  const contractSizesB = await loadContractSizes(hre, hre.config.contractSizer);

  const mergedContractSizes = mergeContractSizes(
    contractSizesA,
    contractSizesB,
  );

  printContractSizesDiff(mergedContractSizes, hre.config.contractSizer);
};

export default action;
