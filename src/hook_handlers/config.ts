import defaultConfig from '../config/default.js';
import { UNITS } from '../logic.js';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';

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
    const resolvedConfig = await next(userConfig, resolveConfigurationVariable);

    const contractSizer = {
      ...defaultConfig,
      ...userConfig.contractSizer,
    };

    return {
      ...resolvedConfig,
      contractSizer,
    };
  },
});
