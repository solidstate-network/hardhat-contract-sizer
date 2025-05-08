import pkg from '../../package.json';
import type { ContractSizerConfig, MergedOutputItem } from '../types.js';
import type { OutputItem, SolcSettings } from '../types.js';
import { DEPLOYED_SIZE_LIMIT, INIT_SIZE_LIMIT, UNITS } from './constants.js';
import chalk from 'chalk';
import Table from 'cli-table3';
import { HardhatPluginError } from 'hardhat/plugins';

const formatDisplayName = (
  { sourceName, contractName }: OutputItem,
  flat: boolean,
) => {
  const fullyQualifiedName = `${sourceName}:${contractName}`;
  return flat ? fullyQualifiedName.split('/').pop()! : fullyQualifiedName;
};

const formatSize = (
  unit: ContractSizerConfig['unit'],
  size: number,
  limit?: number,
): string => {
  const divisor = UNITS[unit];
  const decimalString = (size / divisor).toFixed(3);

  if (limit) {
    if (size > limit) {
      return chalk.red.bold(decimalString);
    } else if (size > limit * 0.9) {
      return chalk.yellow.bold(decimalString);
    }
  }

  return decimalString;
};

const formatSizeDiff = (
  unit: ContractSizerConfig['unit'],
  size: number,
  previousSize: number,
): string => {
  if (size < previousSize) {
    return chalk.green(`-${formatSize(unit, previousSize - size)}`);
  } else if (size > previousSize) {
    return chalk.red(`+${formatSize(unit, size - previousSize)}`);
  } else {
    return chalk.gray(formatSize(unit, 0));
  }
};

export const printContractSizes = (
  outputData: OutputItem[],
  config: ContractSizerConfig,
  oversizedCount: number,
) => {
  // check for display name clashes among contracts

  if (config.flat) {
    outputData.reduce((acc, entry) => {
      const displayName = formatDisplayName(entry, config.flat);

      if (acc.has(displayName)) {
        throw new HardhatPluginError(
          pkg.name,
          `ambiguous contract name: ${displayName}`,
        );
      }

      acc.add(displayName);
      return acc;
    }, new Set());
  }

  // group contracts by compilation settings

  const outputDataBySolcSettings: { [solcVersion: string]: OutputItem[] } =
    outputData.reduce(
      (acc, el) => {
        const key = JSON.stringify(el.solcSettings);
        acc[key] ??= [];
        acc[key].push(el);
        return acc;
      },
      {} as { [solcVersion: string]: OutputItem[] },
    );

  // sort each group of contracts

  for (const key in outputDataBySolcSettings) {
    const outputData = outputDataBySolcSettings[key];

    if (config.alphaSort) {
      outputData.sort((a, b) =>
        formatDisplayName(a, config.flat).toUpperCase() >
        formatDisplayName(b, config.flat).toUpperCase()
          ? 1
          : -1,
      );
    } else {
      outputData.sort((a, b) => a.deploySize - b.deploySize);
    }
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

  for (const key in outputDataBySolcSettings) {
    const outputData = outputDataBySolcSettings[key];

    const solcSettings: SolcSettings = JSON.parse(key) as SolcSettings;

    const { solcVersion } = solcSettings;
    const optimizer =
      solcVersion === 'unknown' ? 'unknown' : solcSettings.optimizer;
    const runs = solcVersion === 'unknown' ? 'unknown' : solcSettings.runs;

    table.push([
      {
        content: chalk.gray(`Solc version: ${solcVersion}`),
      },
      {
        content: chalk.gray(`Optimizer enabled: ${optimizer}`),
      },
      {
        content: chalk.gray(`Runs: ${runs}`),
      },
    ]);

    for (let item of outputData) {
      if (item.deploySize === 0 && item.initSize === 0) {
        continue;
      }

      const deploySize = formatSize(
        config.unit,
        item.deploySize,
        DEPLOYED_SIZE_LIMIT,
      );
      const initSize = formatSize(config.unit, item.initSize, INIT_SIZE_LIMIT);

      table.push([
        { content: formatDisplayName(item, config.flat) },
        { content: deploySize, hAlign: 'right' },
        { content: initSize, hAlign: 'right' },
      ]);
    }
  }

  console.log(table.toString());

  // print or throw size errors, according to configuration

  if (oversizedCount > 0) {
    const subjectPredicateFragment =
      oversizedCount === 1 ? 'contract exceeds' : 'contracts exceed';

    const deployedSizeLimitFragment = `${formatSize(config.unit, DEPLOYED_SIZE_LIMIT)} ${config.unit}`;
    const initSizeLimitFragment = `${formatSize(config.unit, INIT_SIZE_LIMIT)} ${config.unit}`;

    const message = `Warning: ${oversizedCount} ${subjectPredicateFragment} the size limit for mainnet deployment (${deployedSizeLimitFragment} deployed, ${initSizeLimitFragment} init).`;

    if (config.strict) {
      throw new HardhatPluginError(pkg.name, message);
    } else {
      console.log(chalk.red(message));
    }
  }
};

export const printContractSizesDiff = (
  outputData: MergedOutputItem[],
  config: ContractSizerConfig,
  oversizedCount: number,
) => {
  // check for display name clashes among contracts

  if (config.flat) {
    outputData.reduce((acc, entry) => {
      const displayName = formatDisplayName(entry, config.flat);

      if (acc.has(displayName)) {
        throw new HardhatPluginError(
          pkg.name,
          `ambiguous contract name: ${displayName}`,
        );
      }

      acc.add(displayName);
      return acc;
    }, new Set());
  }

  // group contracts by compilation settings

  const outputDataBySolcSettings: {
    [solcVersion: string]: MergedOutputItem[];
  } = outputData.reduce(
    (acc, el) => {
      const key = JSON.stringify(el.solcSettings);
      acc[key] ??= [];
      acc[key].push(el);
      return acc;
    },
    {} as { [solcVersion: string]: MergedOutputItem[] },
  );

  // sort each group of contracts

  for (const key in outputDataBySolcSettings) {
    const outputData = outputDataBySolcSettings[key];

    if (config.alphaSort) {
      outputData.sort((a, b) =>
        formatDisplayName(a, config.flat).toUpperCase() >
        formatDisplayName(b, config.flat).toUpperCase()
          ? 1
          : -1,
      );
    } else {
      outputData.sort((a, b) => a.deploySize - b.deploySize);
    }
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

  for (const key in outputDataBySolcSettings) {
    const outputData = outputDataBySolcSettings[key];

    const solcSettings: SolcSettings = JSON.parse(key) as SolcSettings;

    const { solcVersion } = solcSettings;
    const optimizer =
      solcVersion === 'unknown' ? 'unknown' : solcSettings.optimizer;
    const runs = solcVersion === 'unknown' ? 'unknown' : solcSettings.runs;

    table.push([
      {
        content: chalk.gray(`Solc version: ${solcVersion}`),
      },
      {
        content: chalk.gray(`Optimizer enabled: ${optimizer}`),
      },
      {
        content: chalk.gray(`Runs: ${runs}`),
      },
    ]);

    for (let item of outputData) {
      if (item.deploySize === 0 && item.initSize === 0) {
        continue;
      }

      const deploySize = formatSize(
        config.unit,
        item.deploySize,
        DEPLOYED_SIZE_LIMIT,
      );
      const initSize = formatSize(config.unit, item.initSize, INIT_SIZE_LIMIT);

      const deployDiff = formatSizeDiff(
        config.unit,
        item.deploySize,
        item.previousDeploySize,
      );
      const initDiff = formatSizeDiff(
        config.unit,
        item.initSize,
        item.previousInitSize,
      );

      table.push([
        { content: formatDisplayName(item, config.flat) },
        { content: `${deploySize} (${deployDiff})`, hAlign: 'right' },
        { content: `${initSize} (${initDiff})`, hAlign: 'right' },
      ]);
    }
  }

  console.log(table.toString());

  // print size warning

  if (oversizedCount > 0) {
    const subjectPredicateFragment =
      oversizedCount === 1 ? 'contract exceeds' : 'contracts exceed';

    const deployedSizeLimitFragment = `${formatSize(config.unit, DEPLOYED_SIZE_LIMIT)} ${config.unit}`;
    const initSizeLimitFragment = `${formatSize(config.unit, INIT_SIZE_LIMIT)} ${config.unit}`;

    const message = `Warning: ${oversizedCount} ${subjectPredicateFragment} the size limit for mainnet deployment (${deployedSizeLimitFragment} deployed, ${initSizeLimitFragment} init).`;

    console.log(chalk.red(message));
  }
};
