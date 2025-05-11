import {
  loadContractSizes,
  mergeContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizesDiff } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { createHardhatRuntimeEnvironmentAtGitRef } from '@solidstate/hardhat-git';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  refA: string;
  refB: string;
  noCompile: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  const hreRefA = await createHardhatRuntimeEnvironmentAtGitRef(
    hre.config,
    args.refA,
  );

  const hreRefB = args.refB
    ? await createHardhatRuntimeEnvironmentAtGitRef(hre.config, args.refB)
    : hre;

  if (!args.noCompile) {
    await hreRefA.tasks.getTask(TASK_COMPILE).run();
    await hreRefB.tasks.getTask(TASK_COMPILE).run();
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
