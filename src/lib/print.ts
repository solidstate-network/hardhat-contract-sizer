import pkg from '../../package.json' with { type: 'json' };
import type { ContractSizerConfig, MergedContractSize } from '../types.js';
import type { ContractSize, SolcSettings } from '../types.js';
import { DEPLOYED_SIZE_LIMIT, INIT_SIZE_LIMIT, UNITS } from './constants.js';
import { countOversizedContracts } from './contract_sizer.js';
import { createTable } from '@solidstate/hardhat-solidstate-utils/table';
import chalk from 'chalk';
import { HardhatPluginError } from 'hardhat/plugins';
import { getFullyQualifiedName } from 'hardhat/utils/contract-names';

const formatDisplayName = (
  { sourceName, contractName }: ContractSize,
  flat: boolean,
) => {
  const fullyQualifiedName = getFullyQualifiedName(sourceName, contractName);
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

const generateOversizedContractsWarningMessage = (
  oversizedCount: number,
  unit: ContractSizerConfig['unit'],
) => {
  const subjectPredicateFragment =
    oversizedCount === 1 ? 'contract exceeds' : 'contracts exceed';

  const deployedSizeLimitFragment = `${formatSize(unit, DEPLOYED_SIZE_LIMIT)} ${unit}`;
  const initSizeLimitFragment = `${formatSize(unit, INIT_SIZE_LIMIT)} ${unit}`;

  return `Warning: ${oversizedCount} ${subjectPredicateFragment} the size limit for mainnet deployment (${deployedSizeLimitFragment} deployed, ${initSizeLimitFragment} init).`;
};

export const printContractSizes = (
  contractSizes: ContractSize[],
  config: ContractSizerConfig,
) => {
  // check for display name clashes among contracts

  if (config.flat) {
    contractSizes.reduce((acc, entry) => {
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

  const outputDataBySolcSettings: { [solcVersion: string]: ContractSize[] } =
    contractSizes.reduce(
      (acc, el) => {
        const key = JSON.stringify(el.solcSettings);
        acc[key] ??= [];
        acc[key].push(el);
        return acc;
      },
      {} as { [solcVersion: string]: ContractSize[] },
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

  const table = createTable();

  table.push([
    {
      content: chalk.bold('Contract Name'),
    },
    {
      content: chalk.bold(`Deployed size (${config.unit})`),
    },
    {
      content: chalk.bold(`Initcode size (${config.unit})`),
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

  // print size warning

  const oversizedCount = countOversizedContracts(contractSizes);

  if (oversizedCount > 0) {
    const message = generateOversizedContractsWarningMessage(
      oversizedCount,
      config.unit,
    );

    table.push([
      {
        colSpan: 3,
        content: chalk.red(message),
      },
    ]);
  }

  console.log(table.toString());
};

export const printContractSizesDiff = (
  mergedContractSizes: MergedContractSize[],
  config: ContractSizerConfig,
) => {
  // check for display name clashes among contracts

  if (config.flat) {
    mergedContractSizes.reduce((acc, entry) => {
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
    [solcVersion: string]: MergedContractSize[];
  } = mergedContractSizes.reduce(
    (acc, el) => {
      const key = JSON.stringify(el.solcSettings);
      acc[key] ??= [];
      acc[key].push(el);
      return acc;
    },
    {} as { [solcVersion: string]: MergedContractSize[] },
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

  const table = createTable();

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
        {
          content: `${formatDisplayName(item, config.flat)}${item.solcSettingsChanged ? chalk.gray('*') : ''}`,
        },
        { content: `${deploySize} (${deployDiff})`, hAlign: 'right' },
        { content: `${initSize} (${initDiff})`, hAlign: 'right' },
      ]);
    }
  }

  if (mergedContractSizes.some((s) => s.solcSettingsChanged)) {
    table.push([
      {
        colSpan: 3,
        content: chalk.gray('*solc settings have changed between revisions'),
      },
    ]);
  }

  // print size warning

  const oversizedCount = countOversizedContracts(mergedContractSizes);

  if (oversizedCount > 0) {
    const message = generateOversizedContractsWarningMessage(
      oversizedCount,
      config.unit,
    );

    table.push([
      {
        colSpan: 3,
        content: chalk.red(message),
      },
    ]);
  }

  console.log(table.toString());
};
