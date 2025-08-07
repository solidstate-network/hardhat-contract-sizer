import { name as pluginName } from '../../package.json';
import chalk from 'chalk';
import Table from 'cli-table3';
import fs from 'fs';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';
import { HardhatPluginError } from 'hardhat/plugins';
import path from 'path';
import stripAnsi from 'strip-ansi';

// see EIPs 170 and 3860 for more information
// https://eips.ethereum.org/EIPS/eip-170
// https://eips.ethereum.org/EIPS/eip-3860
const DEPLOYED_SIZE_LIMIT = 24576;
const INIT_SIZE_LIMIT = 49152;

const UNITS = { B: 1, kB: 1000, KiB: 1024 };

task('size-contracts', 'Output the size of compiled contracts')
  .addFlag('noCompile', "Don't compile before running this task")
  .setAction(async (args, hre) => {
    if (!args.noCompile) {
      await hre.run(TASK_COMPILE, { noSizeContracts: true });
    }

    const config = hre.config.contractSizer;

    if (!UNITS[config.unit]) {
      throw new HardhatPluginError(pluginName, `Invalid unit: ${config.unit}`);
    }

    const formatSize = (size: number) => {
      const divisor = UNITS[config.unit];
      return (size / divisor).toFixed(3);
    };

    const outputData: {
      fullName: string;
      displayName: string;
      deploySize: number;
      previousDeploySize?: number;
      initSize: number;
      previousInitSize?: number;
    }[] = [];

    const fullNames = await hre.artifacts.getAllFullyQualifiedNames();

    const outputPath = path.resolve(
      hre.config.paths.cache,
      '.hardhat_contract_sizer_output.json',
    );

    const previousSizes: { [fullName: string]: number } = {};
    const previousInitSizes: { [fullName: string]: number } = {};

    if (fs.existsSync(outputPath)) {
      const previousOutput: {
        fullName: string;
        deploySize: number;
        initSize: number;
      }[] = JSON.parse((await fs.promises.readFile(outputPath)).toString());

      previousOutput.forEach((el) => {
        previousSizes[el.fullName] = el.deploySize;
        previousInitSizes[el.fullName] = el.initSize;
      });
    }

    await Promise.all(
      fullNames.map(async (fullName) => {
        if (config.only.length && !config.only.some((m) => fullName.match(m)))
          return;
        if (
          config.except.length &&
          config.except.some((m) => fullName.match(m))
        )
          return;

        const { deployedBytecode, bytecode } =
          await hre.artifacts.readArtifact(fullName);
        const deploySize = deployedBytecode
          ? Buffer.from(
              deployedBytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
              'hex',
            ).length
          : 0;
        const initSize = bytecode
          ? Buffer.from(
              bytecode.replace(/__\$\w*\$__/g, '0'.repeat(40)).slice(2),
              'hex',
            ).length
          : 0;

        outputData.push({
          fullName,
          displayName: config.disambiguatePaths
            ? fullName
            : (fullName.split(':').pop() ?? ''),
          deploySize,
          previousDeploySize: previousSizes[fullName],
          initSize,
          previousInitSize: previousInitSizes[fullName],
        });
      }),
    );

    if (config.alphaSort) {
      outputData.sort((a, b) =>
        a.displayName.toUpperCase() > b.displayName.toUpperCase() ? 1 : -1,
      );
    } else {
      outputData.sort((a, b) => a.deploySize - b.deploySize);
    }

    await fs.promises.writeFile(outputPath, JSON.stringify(outputData), {
      flag: 'w',
    });

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

    const compiler = hre.config.solidity.compilers[0];

    table.push([
      {
        content: chalk.gray(`Solc version: ${compiler.version}`),
      },
      {
        content: chalk.gray(
          `Optimizer enabled: ${compiler.settings.optimizer.enabled}`,
        ),
      },
      {
        content: chalk.gray(`Runs: ${compiler.settings.optimizer.runs}`),
      },
    ]);

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

    console.log(table.toString());
    if (config.outputFile)
      fs.writeFileSync(config.outputFile, `${stripAnsi(table.toString())}\n`);

    if (oversizedContracts > 0) {
      console.log();

      const message = `Warning: ${oversizedContracts} contracts exceed the size limit for mainnet deployment (${formatSize(DEPLOYED_SIZE_LIMIT)} ${config.unit} deployed, ${formatSize(INIT_SIZE_LIMIT)} ${config.unit} init).`;

      if (config.strict) {
        throw new HardhatPluginError(pluginName, message);
      } else {
        console.log(chalk.red(message));
      }
    }
  });
