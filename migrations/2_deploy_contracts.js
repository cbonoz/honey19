const MyContract = artifacts.require("MyContract");
const LinkTokenInterface = artifacts.require("LinkTokenInterface");

const linkTokenAddress = "0x20fE562d797A42Dcb3399062AE9546cd06f63280";

// weather
// const oracle = "0x4a3fbbb385b5efeb4bc84a25aaadcd644bd09721"
// const jobId = web3.utils.toHex("ca60ea1e28fb4f9586b336e3329517b8");

// marine
const oracle = "0x4a3fbbb385b5efeb4bc84a25aaadcd644bd09721"
const jobId = web3.utils.toHex("57319780bcb44faf8ef9e1742fa2f54d");

const perCallLink = web3.utils.toWei("0.1");
const depositedLink = web3.utils.toWei("1");

module.exports = async function(deployer) {
  await deployer.deploy(
    MyContract,
    linkTokenAddress,
    oracle,
    jobId,
    perCallLink
  );
  const myContract = await MyContract.deployed();

  const linkToken = await LinkTokenInterface.at(linkTokenAddress);
  await linkToken.transfer(myContract.address, depositedLink);
};
