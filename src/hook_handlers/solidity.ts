import { sizeContracts } from '../logic.js';
import type { HookContext, SolidityHooks } from 'hardhat/types/hooks';
import path from 'path';

export default async (): Promise<Partial<SolidityHooks>> => {
  const handlers: Partial<SolidityHooks> = {
    async onCleanUpArtifacts(
      context: HookContext,
      artifactPaths: string[],
      next: (
        nextContext: HookContext,
        artifactPaths: string[],
      ) => Promise<void>,
    ) {
      // TODO: skip if solidity coverage running
      if (context.config.contractSizer.runOnCompile) {
        const fullyQualifiedNames = artifactPaths.map(
          (el) =>
            `${path.relative(context.config.paths.artifacts, path.dirname(el))}:${path.basename(el).split('.').shift()}`,
        );

        const artifacts = await Promise.all(
          Array.from(fullyQualifiedNames).map((el) =>
            context.artifacts.readArtifact(el),
          ),
        );

        await sizeContracts(
          context.config.contractSizer,
          artifacts,
          context.config.paths.cache,
        );
      }

      return next(context, artifactPaths);
    },
  };

  return handlers;
};
