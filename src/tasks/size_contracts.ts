import { sizeContracts } from '../logic.js';
import { NewTaskActionFunction } from 'hardhat/types/tasks';

export interface SizeContractsActionArguments {
  noCompile: boolean;
}

const action: NewTaskActionFunction<SizeContractsActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noSizeContracts) return;

  if (!args.noCompile) {
    // TODO: will task names no longer be stored in constants?
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask('compile').run();
  }

  const fullyQualifiedNames = await hre.artifacts.getAllFullyQualifiedNames();

  const artifacts = await Promise.all(
    Array.from(fullyQualifiedNames).map((el) => hre.artifacts.readArtifact(el)),
  );

  await sizeContracts(
    hre.config.contractSizer,
    artifacts,
    hre.config.paths.cache,
  );
};

export default action;
