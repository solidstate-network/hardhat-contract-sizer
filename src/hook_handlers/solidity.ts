import { sizeContracts } from '../logic.js';
import type { SolidityHooks } from 'hardhat/types/hooks';
import path from 'path';

export default async (): Promise<Partial<SolidityHooks>> => ({
  onCleanUpArtifacts: async (context, artifactPaths, next) => {
    const config = context.config.contractSizer;

    // TODO: skip if solidity coverage running
    if (config.runOnCompile && !context.globalOptions.noSizeContracts) {
      const fullyQualifiedNames = artifactPaths.map(
        (el) =>
          `${path.relative(context.config.paths.artifacts, path.dirname(el))}:${path.basename(el).split('.').shift()}`,
      );

      const artifacts = await Promise.all(
        Array.from(fullyQualifiedNames).map((el) =>
          context.artifacts.readArtifact(el),
        ),
      );

      await sizeContracts(config, artifacts, context.config.paths.cache);
    }

    return next(context, artifactPaths);
  },
});
