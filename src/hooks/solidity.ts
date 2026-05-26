import { loadContractSizes } from '../lib/contract_sizer.js';
import { printContractSizes } from '../lib/print.js';
import hre from 'hardhat';
import type { SolidityHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<SolidityHooks>> => ({
  processArtifactsAfterSuccessfulBuild: async (
    context,
    artifactPaths,
    buildRootFilePaths,
    buildOptions,
  ) => {
    const config = context.config.contractSizer;

    if (
      config.runOnCompile &&
      !context.globalOptions.noSizeContracts &&
      !context.globalOptions.coverage
    ) {
      const contractSizes = await loadContractSizes(context, config);

      printContractSizes(contractSizes, hre.config.contractSizer);
    }
  },
});
