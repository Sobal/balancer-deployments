import { Task, TaskMode } from '@src';

export type NoProtocolFeeLiquidityBootstrappingPoolDeployment = {
  Vault: string;
  WETH: string;
  USDC: string;
};

const Vault = new Task('20210418-vault', TaskMode.READ_ONLY);
const WETH = new Task('00000000-tokens', TaskMode.READ_ONLY);
const USDC = new Task('00000000-tokens', TaskMode.READ_ONLY);

export default {
  Vault,
  WETH,
  USDC,
};
