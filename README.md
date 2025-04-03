# Hardhat Contract Sizer

Output Solidity contract sizes with Hardhat.

> Versions of this plugin prior to `3.0.0` were released as `hardhat-contract-sizer`, outside of the `@solidstate` namespace.

> Versions of this plugin prior to `2.0.0` were released as `buidler-contract-sizer`.

## Installation

```bash
npm install --save-dev @solidstate/hardhat-contract-sizer
# or
yarn add --dev @solidstate/hardhat-contract-sizer
```

## Usage

Load plugin in Hardhat config:

```javascript
import HardhatContractSizer from '@solidstate/hardhat-contract-sizer';

const config: HardhatUserConfig = {
  plugins: [
    HardhatContractSizer,
  ],
  contractSizer: {
    ... // see table for configuration options
  },
};
```

Add configuration under the `contractSizer` key:

| option         | description                                                                                                                 | default |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| `alphaSort`    | whether to sort results table alphabetically (default sort is by contract size)                                             | `false` |
| `runOnCompile` | whether to output contract sizes automatically after compilation                                                            | `false` |
| `flat`         | whether to hide the full path to the compilation artifact and output only the contract name                                 | `false` |
| `strict`       | whether to throw an error if any contracts exceed the size limit (may cause compatibility issues with `solidity-coverage`)  | `false` |
| `only`         | `Array` of `String` matchers used to select included contracts, defaults to all contracts if `length` is 0                  | `[]`    |
| `except`       | `Array` of `String` matchers used to exclude contracts                                                                      | `[]`    |
| `outputFile`   | file path to write contract size report                                                                                     | `null`  |
| `unit`         | unit of measurement for the size of contracts, which can be expressed in 'B' (bytes), 'kB' (kilobytes) or 'KiB' (kibibytes) | `KiB`   |

Run the included Hardhat task to output compiled contract sizes:

```bash
npx hardhat size-contracts
# or
yarn run hardhat size-contracts
```

By default, the hardhat `compile` task is run before sizing contracts. This behavior can be disabled with the `--no-compile` flag:

```bash
npx hardhat size-contracts --no-compile
# or
yarn run hardhat size-contracts --no-compile
```

## Development

Install dependencies via Yarn:

```bash
yarn install
```

Setup Husky to format code on commit:

```bash
yarn prepare
```
