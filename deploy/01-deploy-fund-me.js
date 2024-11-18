// function deployFunction() {
//     console.log("this is a deploy function")
// }

// module.exports.default=deployFunction

module.exports.default = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy } = deployments

    await deploy("FundMe", {
        from: firstAccount,
        args: [180],
        log: true
    })
}