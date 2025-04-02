import hre from 'hardhat';
import type { HookContext, SolidityHooks } from 'hardhat/types/hooks';

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
      await hre.tasks.getTask('size-contracts').run({ noCompile: true });

      return next(context, artifactPaths);
    },
  };

  return handlers;
};
