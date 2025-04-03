import { getConfig } from '../config/get-config.js';
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

      return {
        ...resolvedConfig,
        contractSizer: getConfig(userConfig.contractSizer),
      };
    },
  };

  return handlers;
};
