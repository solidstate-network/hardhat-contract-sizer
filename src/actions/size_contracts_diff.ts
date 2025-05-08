import {
  countOversizedContracts,
  getTmpHreAtGitRef,
  loadContractSizes,
  mergeContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizesDiff } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { NewTaskActionFunction } from 'hardhat/types/tasks';

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

  const hreRefA = await getTmpHreAtGitRef(hre, args.refA);

  const hreRefB = args.refB ? await getTmpHreAtGitRef(hre, args.refB) : hre;

  if (!args.noCompile) {
    await hreRefA.tasks.getTask(TASK_COMPILE).run();
    await hreRefB.tasks.getTask(TASK_COMPILE).run();
  }

  const sizedContractsA = await loadContractSizes(
    hre,
    hre.config.contractSizer,
  );

  const sizedContractsB = await loadContractSizes(
    hre,
    hre.config.contractSizer,
  );

  const mergedContractSizes = mergeContractSizes(
    sizedContractsA,
    sizedContractsB,
  );

  const oversizedCount = countOversizedContracts(sizedContractsB);

  printContractSizesDiff(
    mergedContractSizes,
    hre.config.contractSizer,
    oversizedCount,
  );
};

export default action;
