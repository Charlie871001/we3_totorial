// function deployFunction() {
//     console.log("this is a deploy function")
// }

// module.exports.default=deployFunction
const { network } = require("hardhat")
const { developmentChains, LOCK_TIME, networkConfig, CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy } = deployments

    let dataFeedAddr
    if (developmentChains.includes(network.name)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
    }


    await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: CONFIRMATIONS
    })

    // remove deployments directory or add --reset if you redeploy contract
    // npx hardhat deploy --netwrok sepolia --reset
}

module.exports.tags = ["all", "fundme"]
