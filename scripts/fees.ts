import hre from 'hardhat';
import { BigNumber, Contract, utils } from 'ethers';
import { instanceAt, Task, TaskMode } from '@src';
import { bn } from '@helpers/numbers';
import { actionId } from '@helpers/models/misc/actions';

const ETHER = (amount: number) => hre.ethers.utils.parseEther(amount.toString());

async function main() {
  let vault: Contract, authorizer: Contract, feeProvider: Contract, feesCollector: Contract;

  const [admin] = await hre.ethers.getSigners();

  feeProvider = await new Task(
    '20220725-protocol-fee-percentages-provider',
    TaskMode.READ_ONLY,
    hre.network.name
  ).deployedInstance('ProtocolFeePercentagesProvider');
  authorizer = await new Task('20210418-authorizer', TaskMode.READ_ONLY, hre.network.name).deployedInstance(
    'Authorizer'
  );
  feesCollector = await new Task('20210418-vault', TaskMode.READ_ONLY, hre.network.name).deployedInstance(
    'ProtocolFeesCollector'
  );

  enum ProtocolFeeType {
    SWAP = 0,
    FLASH_LOAN = 1,
    YIELD = 2,
    AUM = 3,
  }

  console.log('--');
  console.log('network name:', hre.network.name);
  console.log('fee provider address:', feeProvider.address);
  console.log('admin0', await authorizer.getRoleMember(await authorizer.DEFAULT_ADMIN_ROLE(), 0));
  console.log('--');
  
  await authorizer
  .connect(admin)
  .grantRole(await actionId(feeProvider, 'setFeeTypePercentage'), admin.address);
  await authorizer
  .connect(admin)
  .grantRole(await actionId(feesCollector, 'setFlashLoanFeePercentage'), feeProvider.address);
  
  // swap:      500000000000000000
  // flashloan:  10000000000000000
  // yield:     500000000000000000
  // aum:       500000000000000000
  console.log('swap:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.SWAP)).toString());
  console.log('flashloan:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.FLASH_LOAN)).toString());
  console.log('yield:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.YIELD)).toString());
  console.log('aum:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.AUM)).toString());

  await feeProvider.connect(admin).setFeeTypePercentage(ProtocolFeeType.SWAP, BigNumber.from('500000000000000000'));
  await feeProvider
    .connect(admin)
    .setFeeTypePercentage(ProtocolFeeType.FLASH_LOAN, BigNumber.from('10000000000000000'));
  await feeProvider.connect(admin).setFeeTypePercentage(ProtocolFeeType.YIELD, BigNumber.from('500000000000000000'));
  await feeProvider.connect(admin).setFeeTypePercentage(ProtocolFeeType.AUM, BigNumber.from('500000000000000000'));

  console.log('--');
  console.log('swapfee on feesCollector', (await feesCollector.getSwapFeePercentage()).toString());
  console.log('--');
  console.log('swap:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.SWAP)).toString());
  console.log('flashloan:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.FLASH_LOAN)).toString());
  console.log('yield:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.YIELD)).toString());
  console.log('aum:', (await feeProvider.getFeeTypePercentage(ProtocolFeeType.AUM)).toString());
  console.log('--');




}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
