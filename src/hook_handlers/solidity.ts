import { sizeContracts } from '../logic.js';
import type { SolidityHooks } from 'hardhat/types/hooks';
import path from 'path';

export default async (): Promise<Partial<SolidityHooks>> => ({
  onCleanUpArtifacts: async (context, artifactPaths, next) => {
    const config = context.config.contractSizer;

    // TODO: skip if solidity coverage running
    if (config.runOnCompile && !context.globalOptions.noSizeContracts) {
      await sizeContracts(context, config);
    }

    return next(context, artifactPaths);
  },
});
