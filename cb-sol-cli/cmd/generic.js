const ethers = require('ethers');
const {Command} = require('commander');
const Helpers = require('./helpers');

const {setupParentArgs, log, waitForTx} = require("./utils")

const constants = require('../constants');

const getHashCmd = new Command('deposit')
    .description('generic data transfer')
    .option('--dest <id>', "Destination chain ID", 1)
    .option('--recipient <address>', 'Destination recipient address', constants.relayerAddresses[4])
    .option('--resourceId <id>', 'ResourceID for transfer', constants.ERC20_RESOURCEID)
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--data <data>', 'Generic data to transfer ', "0x1234")
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent);
        // Instances
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        const hashOfCentrifugeAsset = ethers.utils.keccak256(args.data);
        const data = Helpers.createGenericDepositData(args.data);

        log(args, `Constructed generic data deposit:`)
        log(args, `  Resource Id: ${args.resourceId}`)
        log(args, `  len(recipient): ${(args.recipient.length - 2)/ 2}`)
        log(args, `  Recipient: ${args.recipient}`)
        log(args, `  Raw: ${data}`)
        log(args, `Creating generic data deposit to initiate transfer!`);

        // Make the generic data deposit
        let tx = await bridgeInstance.deposit(
            args.dest, // destination chain id
            args.resourceId,
            data
        );

        await waitForTx(args.provider, tx.hash)
    })

const genericCmd = new Command("generic")

genericCmd.addCommand(getHashCmd)

module.exports = genericCmd
