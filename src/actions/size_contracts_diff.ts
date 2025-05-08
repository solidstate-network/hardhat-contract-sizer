import {
  countOversizedContracts,
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

  if (!args.noCompile && !args.refB) {
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask(TASK_COMPILE).run();
  }

  const sizedContractsA = await loadContractSizes(
    hre,
    hre.config.contractSizer,
    args.refA,
    args.noCompile,
  );

  const sizedContractsB = await loadContractSizes(
    hre,
    hre.config.contractSizer,
    args.refB,
    args.noCompile,
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
