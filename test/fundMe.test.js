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
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })

    it("test if the owner is msg.sender.", async function () {
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()), firstAccount)
    })

    // fund getFund reFund
    // unit test for fund
    // window closed, value greater than minimum value, funder balance
    it("window is closed, value is greater than minimum, fund failed.",
        async function () {
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()
            // alue is greater than minimun value
            expect(fundMe.fund({ value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("window is closed")
        }
    )

    it("window open, value is less than minimun value, fund failed.", async function () {
        expect(fundMe.fund({ value: ethers.parseEther("0.01") }))
            .to.be.revertedWith("Send more ETH")
    })

    it("window open, value is greater than minimum, fund sucess.", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        const balance = await fundMe.fundersToAmount(firstAccount)
        expect(balance).to.equals(ethers.parseEther("0.1"))
    })

    // uint test for getFund
    // onlyOwner,windowClose,target reached
    // not owner, window closed, target reached, getFund failed
    it("not owner, window closed, target reached, getFund failed.", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") })
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMeSecondAccount.getFund())
            .to.be.revertedWith("this function can only be called by owner")
    })

    // window open, target reached
    it("window open, target reached, getFund failed.", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") })
        await expect(fundMe.getFund())
            .to.be.revertedWith("window is not closed")
    })

    // window closed, target not reached, getFund failed
    it("window closed, target not reached, getFund failed.", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.getFund())
            .to.be.revertedWith("Target is not reached")
    })

    // window closed, target reached, getFund sucess
    it("window closed, target reached, getFund sucess.", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") })
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.getFund())
            .to.emit(fundMe, "FundWithdrawByOwner")
            .withArgs(ethers.parseEther("1"))
    })

    // refund
    // window closed, target not reached, funder has balance
    it("window open,target not reached, funder has balance, refund failed.", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        await expect(fundMe.refund())
            .to.be.revertedWith("window is not closed")
    })

    it("window closed, target reached, funder has balance, refund failed.", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") })
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.refund())
            .to.be.revertedWith("Target is reached")
    })

    it("window closed, target not reached, funder does not have balance, refund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMeSecondAccount.refund())
            .to.be.revertedWith("There is no fund for you")
    })

    it("window closed, target not reached,funder has balance,refund sucess", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.refund())
            .to.emit(fundMe, "RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.1"))
    })

})