import { loadContractSizes } from '../src/lib/contract_sizer.js';
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
