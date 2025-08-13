import { DEPLOYED_SIZE_LIMIT, INIT_SIZE_LIMIT } from '../src/lib/constants.js';
import {
  countOversizedContracts,
  loadContractSizes,
  mergeContractSizes,
  validateNoOversizedContracts,
} from '../src/lib/contract_sizer.js';
import { DEFAULT_SOLC_SETTINGS } from '../src/lib/solc_settings.js';
import type { ContractSize, MergedContractSize } from '../src/types.js';
import hre from 'hardhat';
import { getFullyQualifiedName } from 'hardhat/utils/contract-names';
import assert from 'node:assert';
import { describe, it } from 'node:test';

describe('loadContractSizes', () => {
  it('calculates contract sizes from artifacts', async () => {
    const contractSizes = await loadContractSizes(hre);

    const [solcSettings] = hre.config.solidity.profiles.default.compilers;
    const fullyQualifiedNames = await hre.artifacts.getAllFullyQualifiedNames();

    assert.equal(contractSizes.length, fullyQualifiedNames.size);

    for (const contractSize of contractSizes) {
      assert(
        fullyQualifiedNames.has(
          getFullyQualifiedName(
            contractSize.sourceName,
            contractSize.contractName,
          ),
        ),
      );

      assert(typeof contractSize.deploySize === 'number');
      assert(typeof contractSize.initSize === 'number');

      assert.equal(contractSize.solcSettings.solcVersion, solcSettings.version);
      assert.equal(
        contractSize.solcSettings.optimizer,
        !!solcSettings.settings.enabled,
      );
      assert.equal(
        contractSize.solcSettings.runs,
        solcSettings.settings.runs || 0,
      );
    }
  });
});

describe('mergeContractSizes', () => {
  it('merges contract size arrays', async () => {
    const removed: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'removed',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: true, runs: 0 },
    };
    const added: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'added',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: true, runs: 0 },
    };
    const unchanged: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'unchanged',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: true, runs: 0 },
    };
    const changedSize: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'changedSize',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: true, runs: 0 },
    };
    const changedSizeAfter = {
      ...changedSize,
      deploySize: changedSize.deploySize + 1,
    };
    const changedSolcVersion: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'changedSolcSettings',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: true, runs: 0 },
    };
    const changedSolcVersionAfter = {
      ...changedSolcVersion,
      solcSettings: { ...changedSolcVersion.solcSettings, runs: 1 },
    };
    const changedRuns: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'changedRuns',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: true, runs: 0 },
    };
    const changedRunsAfter = {
      ...changedRuns,
      solcSettings: { ...changedRuns.solcSettings, runs: 1 },
    };
    const changedRunsNoOptimizer: ContractSize = {
      sourceName: 'contracts/Test.sol',
      contractName: 'changedRunsNoOptimizer',
      deploySize: 1,
      initSize: 1,
      solcSettings: { solcVersion: '0.8.29', optimizer: false, runs: 0 },
    };
    const changedRunsNoOptimizerAfter = {
      ...changedRunsNoOptimizer,
      solcSettings: { ...changedRunsNoOptimizer.solcSettings, runs: 1 },
    };

    const contractSizesA: ContractSize[] = [
      removed,
      unchanged,
      changedSize,
      changedSolcVersion,
      changedRuns,
      changedRunsNoOptimizer,
    ];

    const contractSizesB: ContractSize[] = [
      added,
      unchanged,
      changedSizeAfter,
      changedSolcVersionAfter,
      changedRunsAfter,
      changedRunsNoOptimizerAfter,
    ];

    const mergedContractSizes = mergeContractSizes(
      contractSizesA,
      contractSizesB,
    );

    const expected: MergedContractSize[] = [
      {
        ...added,
        previousDeploySize: 0,
        previousInitSize: 0,
        solcSettingsChanged: true,
      },
      {
        sourceName: removed.sourceName,
        contractName: removed.contractName,
        deploySize: 0,
        initSize: 0,
        previousDeploySize: removed.deploySize,
        previousInitSize: removed.initSize,
        solcSettings: DEFAULT_SOLC_SETTINGS,
        solcSettingsChanged: true,
      },
      {
        ...unchanged,
        previousDeploySize: unchanged.deploySize,
        previousInitSize: unchanged.initSize,
        solcSettingsChanged: false,
      },
      {
        ...changedSizeAfter,
        previousDeploySize: changedSize.deploySize,
        previousInitSize: changedSize.initSize,
        solcSettingsChanged: false,
      },
      {
        ...changedSolcVersionAfter,
        previousDeploySize: changedSolcVersion.deploySize,
        previousInitSize: changedSolcVersion.initSize,
        solcSettingsChanged: true,
      },
      {
        ...changedRunsAfter,
        previousDeploySize: changedRuns.deploySize,
        previousInitSize: changedRuns.initSize,
        solcSettingsChanged: true,
      },
      {
        ...changedRunsNoOptimizerAfter,
        previousDeploySize: changedRunsNoOptimizer.deploySize,
        previousInitSize: changedRunsNoOptimizer.initSize,
        solcSettingsChanged: false,
      },
    ];

    assert.deepStrictEqual(
      mergedContractSizes.sort((a, b) =>
        a.contractName > b.contractName ? 1 : -1,
      ),
      expected.sort((a, b) => (a.contractName > b.contractName ? 1 : -1)),
    );
  });
});

describe('countOversizedContracts', () => {
  it('returns number of oversized contracts', () => {
    const contractSizes: ContractSize[] = [
      { deploySize: DEPLOYED_SIZE_LIMIT, initSize: INIT_SIZE_LIMIT },
      { deploySize: DEPLOYED_SIZE_LIMIT + 1, initSize: INIT_SIZE_LIMIT },
      { deploySize: DEPLOYED_SIZE_LIMIT, initSize: INIT_SIZE_LIMIT + 1 },
      { deploySize: DEPLOYED_SIZE_LIMIT + 1, initSize: INIT_SIZE_LIMIT + 1 },
    ].map((el) => ({
      ...el,
      sourceName: '',
      contractName: '',
      solcSettings: DEFAULT_SOLC_SETTINGS,
    }));

    const oversizedContracts = countOversizedContracts(contractSizes);

    assert.equal(oversizedContracts, 3);
  });
});

describe('validateNoOversizedContracts', () => {
  it('does not throw if all contracts are within size limit', async () => {
    assert.doesNotThrow(() => validateNoOversizedContracts([]));

    assert.doesNotThrow(() =>
      validateNoOversizedContracts([
        {
          sourceName: '',
          contractName: '',
          deploySize: DEPLOYED_SIZE_LIMIT,
          initSize: INIT_SIZE_LIMIT,
          solcSettings: DEFAULT_SOLC_SETTINGS,
        },
      ]),
    );
  });

  it('throws if any contracts are oversized', async () => {
    assert.throws(() =>
      validateNoOversizedContracts([
        {
          sourceName: '',
          contractName: '',
          deploySize: DEPLOYED_SIZE_LIMIT + 1,
          initSize: INIT_SIZE_LIMIT,
          solcSettings: DEFAULT_SOLC_SETTINGS,
        },
      ]),
    );

    assert.throws(() =>
      validateNoOversizedContracts([
        {
          sourceName: '',
          contractName: '',
          deploySize: DEPLOYED_SIZE_LIMIT,
          initSize: INIT_SIZE_LIMIT + 1,
          solcSettings: DEFAULT_SOLC_SETTINGS,
        },
      ]),
    );
  });
});
