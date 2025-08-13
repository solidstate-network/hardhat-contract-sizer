import type { SolcSettings } from '../types.js';

export const DEFAULT_SOLC_SETTINGS: SolcSettings = {
  solcVersion: 'unknown',
  optimizer: false,
  runs: 0,
};

export const equal = (
  solcSettingsA: SolcSettings,
  solcSettingsB: SolcSettings,
) => {
  // ignore the `runs` value unless `optimizer` is `true`
  const optimizerA = solcSettingsA.optimizer && solcSettingsA.runs;
  const optimizerB = solcSettingsB.optimizer && solcSettingsB.runs;
  return (
    solcSettingsA.solcVersion === solcSettingsB.solcVersion &&
    optimizerA === optimizerB
  );
};
