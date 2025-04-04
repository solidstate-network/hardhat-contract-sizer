import { sizeContracts } from '../logic.js';
import { NewTaskActionFunction } from 'hardhat/types/tasks';

export interface SizeContractsActionArguments {
  noCompile?: boolean;
}

const action: NewTaskActionFunction<SizeContractsActionArguments> = async (
  args,
  hre,
): Promise<void> => {
  const config = hre.config.contractSizer;

  if (!args.noCompile) {
    // TODO: will task names no longer be stored in constants?
    hre.globalOptions.noSizeContracts = true;
    await hre.tasks.getTask('compile').run();
  }

  const fullyQualifiedNames = await hre.artifacts.getAllFullyQualifiedNames();

  const artifacts = await Promise.all(
    Array.from(fullyQualifiedNames).map((el) => hre.artifacts.readArtifact(el)),
  );

  await sizeContracts(config, artifacts, hre.config.paths.cache);
};

export default action;
