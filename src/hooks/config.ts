import { UNITS } from '../lib/constants.js';
import { ContractSizerConfig } from '../types.js';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';

const DEFAULT_CONFIG: ContractSizerConfig = {
  alphaSort: false,
  runOnCompile: false,
  flat: false,
  strict: false,
  only: [],
  except: [],
  unit: 'KiB',
};

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (userConfig) => {
    const errors: HardhatUserConfigValidationError[] = [];

    const { contractSizer } = userConfig;

    if (
      contractSizer?.unit &&
      !Object.keys(UNITS).includes(contractSizer.unit)
    ) {
      errors.push({
        path: ['contractSizer', 'unit'],
        message: `unit must be one of the following: ${Object.keys(UNITS).join(', ')}`,
      });
    }

    return errors;
  },

  resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
    return {
      ...(await next(userConfig, resolveConfigurationVariable)),
      contractSizer: {
        ...DEFAULT_CONFIG,
        ...userConfig.contractSizer,
      },
    };
  },
});
