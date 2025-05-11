export type ContractSizerConfig = {
  alphaSort: boolean;
  runOnCompile: boolean;
  flat: boolean;
  strict: boolean;
  only: string[];
  except: string[];
  unit: 'B' | 'kB' | 'KiB';
};

export type ContractSizerUserConfig = Partial<ContractSizerConfig>;

export type SolcSettings = {
  solcVersion: string;
  optimizer: boolean;
  runs: number;
};

export type ContractSize = {
  sourceName: string;
  contractName: string;
  deploySize: number;
  initSize: number;
  solcSettings: SolcSettings;
};

export type MergedContractSize = ContractSize & {
  previousDeploySize: number;
  previousInitSize: number;
};
