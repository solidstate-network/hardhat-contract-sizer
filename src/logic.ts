import pkg from '../package.json';
import type { HardhatContractSizerConfig } from './types.js';
import chalk from 'chalk';
import Table from 'cli-table3';
import fs from 'fs';
import { HardhatPluginError } from 'hardhat/plugins';
import { HookContext } from 'hardhat/types/hooks';
import path from 'path';
import stripAnsi from 'strip-ansi';

// see EIPs 170 and 3860 for more information
// https://eips.ethereum.org/EIPS/eip-170
// https://eips.ethereum.org/EIPS/eip-3860
const DEPLOYED_SIZE_LIMIT = 24576;
const INIT_SIZE_LIMIT = 49152;

export const UNITS: { [key in HardhatContractSizerConfig['unit']]: number } = {
  B: 1,
  kB: 1000,
  KiB: 1024,
};

export async function sizeContracts(
  context: HookContext,
  config: HardhatContractSizerConfig,
) {
  const formatSize = (size: number) => {
    const divisor = UNITS[config.unit];
    return (size / divisor).toFixed(3);
  };

  type Output = {
    sourceName: string;
    displayName: string;
    deploySize: number;
    previousDeploySize?: number;
    initSize: number;
    previousInitSize?: number;
  }[];

  const outputPath = path.resolve(
    context.config.paths.cache,
    '.hardhat_contract_sizer_output.json',
  );

  // read results of previous runs from disk

  const previousSizes: { [sourceName: string]: number } = {};
  const previousInitSizes: { [sourceName: string]: number } = {};

  if (fs.existsSync(outputPath)) {
    const previousOutput: {
      sourceName: string;
      deploySize: number;
      initSize: number;
    }[] = JSON.parse((await fs.promises.readFile(outputPath)).toString());

    previousOutput.forEach((el) => {
      previousSizes[el.sourceName] = el.deploySize;
      previousInitSizes[el.sourceName] = el.initSize;
    });
  }

  // get list of all contracts and filter according to configuraiton

  const fullNames = Array.from(
    await context.artifacts.getAllFullyQualifiedNames(),
  ).filter((fullName) => {
    if (config.only.length && !config.only.some((m) => fullName.match(m)))
      return;
    if (config.except.length && config.except.some((m) => fullName.match(m)))
      return;
    return true;
  });

  // get contract artifacts

  const artifacts = await Promise.all(
    fullNames.map((fullName) => context.artifacts.readArtifact(fullName)),
  );

  // calculate contract sizes and match with data from previous runs

  const outputData: Output = artifacts.map((artifact) => {
    const { sourceName, deployedBytecode, bytecode } = artifact;

    const deploySize = Buffer.from(
      deployedBytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
      'hex',
    ).length;
    const initSize = Buffer.from(
      bytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
      'hex',
    ).length;

    // TODO: displayName formatting is incorrect because fullName is not used here

    return {
      sourceName,
      displayName: config.flat ? sourceName.split(':').pop()! : sourceName,
      deploySize,
      previousDeploySize: previousSizes[sourceName],
      initSize,
      previousInitSize: previousInitSizes[sourceName],
    };
  });

  // check for display name clashes among contracts

  outputData.reduce((acc, { displayName }) => {
    if (acc.has(displayName)) {
      throw new HardhatPluginError(
        pkg.name,
        `ambiguous contract name: ${displayName}`,
      );
    }

    acc.add(displayName);
    return acc;
  }, new Set());

  // write size results to disk for future comparison

  await fs.promises.writeFile(outputPath, JSON.stringify(outputData), {
    flag: 'w',
  });

  // sort results

  if (config.alphaSort) {
    outputData.sort((a, b) =>
      a.displayName.toUpperCase() > b.displayName.toUpperCase() ? 1 : -1,
    );
  } else {
    outputData.sort((a, b) => a.deploySize - b.deploySize);
  }

  // generate table of results

  const table = new Table({
    style: { head: [], border: [], 'padding-left': 2, 'padding-right': 2 },
    chars: {
      mid: '·',
      'top-mid': '|',
      'left-mid': ' ·',
      'mid-mid': '|',
      'right-mid': '·',
      left: ' |',
      'top-left': ' ·',
      'top-right': '·',
      'bottom-left': ' ·',
      'bottom-right': '·',
      middle: '·',
      top: '-',
      bottom: '-',
      'bottom-mid': '|',
    },
  });

  // TODO: show compiler information

  // const compiler = {
  //   version: 'TODO',
  //   settings: { optimizer: { enabled: 'TODO', runs: 'TODO' } },
  // };

  // table.push([
  //   {
  //     content: chalk.gray(`Solc version: ${compiler.version}`),
  //   },
  //   {
  //     content: chalk.gray(
  //       `Optimizer enabled: ${compiler.settings.optimizer.enabled}`,
  //     ),
  //   },
  //   {
  //     content: chalk.gray(`Runs: ${compiler.settings.optimizer.runs}`),
  //   },
  // ]);

  table.push([
    {
      content: chalk.bold('Contract Name'),
    },
    {
      content: chalk.bold(`Deployed size (${config.unit}) (change)`),
    },
    {
      content: chalk.bold(`Initcode size (${config.unit}) (change)`),
    },
  ]);

  let oversizedContracts = 0;

  for (let item of outputData) {
    if (item.deploySize === 0 && item.initSize === 0) {
      continue;
    }

    let deploySize = formatSize(item.deploySize);
    let initSize = formatSize(item.initSize);

    if (
      item.deploySize > DEPLOYED_SIZE_LIMIT ||
      item.initSize > INIT_SIZE_LIMIT
    ) {
      oversizedContracts++;
    }

    if (item.deploySize > DEPLOYED_SIZE_LIMIT) {
      deploySize = chalk.red.bold(deploySize);
    } else if (item.deploySize > DEPLOYED_SIZE_LIMIT * 0.9) {
      deploySize = chalk.yellow.bold(deploySize);
    }

    if (item.initSize > INIT_SIZE_LIMIT) {
      initSize = chalk.red.bold(initSize);
    } else if (item.initSize > INIT_SIZE_LIMIT * 0.9) {
      initSize = chalk.yellow.bold(initSize);
    }

    let deployDiff = '';
    let initDiff = '';

    if (item.previousDeploySize) {
      if (item.deploySize < item.previousDeploySize) {
        deployDiff = chalk.green(
          `-${formatSize(item.previousDeploySize - item.deploySize)}`,
        );
      } else if (item.deploySize > item.previousDeploySize) {
        deployDiff = chalk.red(
          `+${formatSize(item.deploySize - item.previousDeploySize)}`,
        );
      } else {
        deployDiff = chalk.gray(formatSize(0));
      }
    }

    if (item.previousInitSize) {
      if (item.initSize < item.previousInitSize) {
        initDiff = chalk.green(
          `-${formatSize(item.previousInitSize - item.initSize)}`,
        );
      } else if (item.initSize > item.previousInitSize) {
        initDiff = chalk.red(
          `+${formatSize(item.initSize - item.previousInitSize)}`,
        );
      } else {
        initDiff = chalk.gray(formatSize(0));
      }
    }

    table.push([
      { content: item.displayName },
      { content: `${deploySize} (${deployDiff})`, hAlign: 'right' },
      { content: `${initSize} (${initDiff})`, hAlign: 'right' },
    ]);
  }

  // print table or write to disk, according to configuration

  if (config.outputFile) {
    fs.writeFileSync(config.outputFile, `${stripAnsi(table.toString())}\n`);
  } else {
    console.log(table.toString());
  }

  // print or throw size errors, according to configuration

  if (oversizedContracts > 0) {
    const message = `Warning: ${oversizedContracts} contracts exceed the size limit for mainnet deployment (${formatSize(DEPLOYED_SIZE_LIMIT)} ${config.unit} deployed, ${formatSize(INIT_SIZE_LIMIT)} ${config.unit} init).`;

    if (config.strict) {
      throw new HardhatPluginError(pkg.name, message);
    } else if (!config.outputFile) {
      console.log();
      console.log(chalk.red(message));
    }
  }
}
