export type HardhatContractSizerConfig = {
  alphaSort: boolean;
  runOnCompile: boolean;
  flat: boolean;
  strict: boolean;
  only: string[];
  except: string[];
  outputFile?: string;
  unit: 'B' | 'kB' | 'KiB';
};

export type HardhatContractSizerUserConfig =
  Partial<HardhatContractSizerConfig>;

export type SolcSettings = {
  solcVersion: string;
  optimizer: boolean;
  runs: number;
};

export type OutputItem = {
  sourceName: string;
  displayName: string;
  deploySize: number;
  previousDeploySize?: number;
  initSize: number;
  previousInitSize?: number;
  solcSettings: SolcSettings;
};
