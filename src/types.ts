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
