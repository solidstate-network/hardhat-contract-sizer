import './tasks/compile';
import './tasks/size_contracts';
import './type-extensions';
import { extendConfig } from 'hardhat/config';
import 'hardhat/types/config';

extendConfig((config, userConfig) => {
  config.contractSizer = Object.assign(
    {
      alphaSort: false,
      runOnCompile: false,
      flat: false,
      strict: false,
      only: [],
      except: [],
      outputFile: null,
      unit: 'KiB',
    },
    userConfig.contractSizer,
  );
});
