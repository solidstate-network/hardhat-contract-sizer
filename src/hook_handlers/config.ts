import defaultConfig from '../config/default.js';
import type { ConfigHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
    resolveUserConfig: async (
      userConfig,
      resolveConfigurationVariable,
      next,
    ) => {
      const resolvedConfig = await next(
        userConfig,
        resolveConfigurationVariable,
      );

      const contractSizer = {
        ...defaultConfig,
        ...userConfig.contractSizer,
      };

      return {
        ...resolvedConfig,
        contractSizer,
      };
    },
  };

  return handlers;
};
