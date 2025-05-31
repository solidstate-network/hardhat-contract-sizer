import pkg from '../../package.json';
import {
  countOversizedContracts,
  loadContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
import { TASK_COMPILE } from '../task_names.js';
import { createHardhatRuntimeEnvironmentAtGitRev } from '@solidstate/hardhat-git';
import { HardhatPluginError } from 'hardhat/plugins';
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

  if (
    hre.config.contractSizer.strict &&
    countOversizedContracts(contractSizes) > 0
  ) {
    throw new HardhatPluginError(
      pkg.name,
      'strict mode is enabled and oversized contracts were found',
    );
  }
};

export default action;
