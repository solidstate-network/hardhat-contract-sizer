import pkg from '../../package.json';
import {
  countOversizedContracts,
  loadContractSizes,
  mergeContractSizes,
} from '../lib/contract_sizer.js';
import { printContractSizesDiff } from '../lib/print.js';
import { HardhatPluginError } from 'hardhat/plugins';
import { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  refs: string[];
  noCompile: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  if (!args.noCompile) {
    // TODO: will task names no longer be stored in constants?
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask('compile').run();
  }

  const refs = [...args.refs];

  if (refs.length === 0) {
    refs.push('HEAD');
  } else if (refs.length > 2) {
    // TODO: throw error
    throw new HardhatPluginError(
      pkg.name,
      'A maximum of two refs may be specified',
    );
  }
  // TODO: ref is not compatible with --no-compile option

  const sizedContractsA = await loadContractSizes(
    hre,
    hre.config.contractSizer,
    refs[0],
  );

  const sizedContractsB = await loadContractSizes(
    hre,
    hre.config.contractSizer,
    refs[1],
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
