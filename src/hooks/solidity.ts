import { loadContractSizes } from '../lib/contract_sizer.js';
import type { SolidityHooks } from 'hardhat/types/hooks';
import path from 'path';

export default async (): Promise<Partial<SolidityHooks>> => ({
  onCleanUpArtifacts: async (context, artifactPaths, next) => {
    const config = context.config.contractSizer;

    if (
      config.runOnCompile &&
      !context.globalOptions.noSizeContracts &&
      !context.globalOptions.coverage
    ) {
      await loadContractSizes(context, config);
    }

    return next(context, artifactPaths);
  },
});
