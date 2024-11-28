const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

describe("test fundMe contract", async function () {
    let firstAccount
    let secondAccount
    let fundMe
    let fundMeSecondAccount
    let mockV3Aggregator
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("mockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe",secondAccount)
    })

    it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()), firstAccount)
    })

    // fund getFund reFund
    // unit test for fund
    // window closed, value greater than minimum value, funder balance
    it("window is closed, value is greater than minimum, fund failed",
        async function () {
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()
            // alue is greater than minimun value
            expect(fundMe.fund({ value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("window is closed")
        }
    )

    it("window open, value is less than minimun value, fund failed", async function () {
        expect(fundMe.fund({ value: ethers.parseEther("0.01") }))
            .to.be.revertedWith("Send more ETH")
    })

    it("window open, value is greater than minimum, fund sucess", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        const balance = await fundMe.fundersToAmount(firstAccount)
        expect(balance).to.equals(ethers.parseEther("0.1"))
    })

    // uint test for getFund
    // 
    it("",async function () {
        
    })


})