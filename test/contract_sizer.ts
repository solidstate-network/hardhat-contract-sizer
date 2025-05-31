import { DEPLOYED_SIZE_LIMIT, INIT_SIZE_LIMIT } from '../src/lib/constants.js';
import {
  countOversizedContracts,
  loadContractSizes,
  validateNoOversizedContracts,
} from '../src/lib/contract_sizer.js';
import { DEFAULT_SOLC_SETTINGS } from '../src/lib/solc_settings.js';
import type { ContractSize } from '../src/types.js';
import hre from 'hardhat';
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
          `${contractSize.sourceName}:${contractSize.contractName}`,
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
