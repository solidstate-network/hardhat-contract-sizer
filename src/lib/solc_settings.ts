import type { SolcSettings } from '../types.js';

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
