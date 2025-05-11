import { loadContractSizes } from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
import hre from 'hardhat';
import type { SolidityHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<SolidityHooks>> => ({
  onCleanUpArtifacts: async (context, artifactPaths, next) => {
    const config = context.config.contractSizer;

    if (
      config.runOnCompile &&
      !context.globalOptions.noSizeContracts &&
      !context.globalOptions.coverage
    ) {
      const contractSizes = await loadContractSizes(context, config);

      printContractSizes(contractSizes, hre.config.contractSizer);
    }

    return next(context, artifactPaths);
  },
});
