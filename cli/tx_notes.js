import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';

dotenv.config();

const GAME_ADMIN_ADDRESS = process.env.GAME_ADMIN_ADDRESS;
const TRADE_WARS_ADDRESS = process.env.TRADE_WARS_ADDRESS;


// create a new SuiClient object pointing to the network you want to use
const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });

export const balance = await 
    suiClient.getBalance({
		owner: GAME_ADMIN_ADDRESS,
	}
);

export const result = await client.signAndExecuteTransactionBlock({
	transaction: sources_tx,
    signer: Keypair,
	requestType: 'WaitForLocalExecution',
	options: {
        showBalanceChanges: true,
		showEffects: true,
        showEvents: true,
        showInput: true,
        showObjectChanges: true,
        showRawInput: true,
	},
});

// asynchronously call suix_getCommitteeInfo, not included in the Sui SDK
const committeeInfo = await client.call('suix_getCommitteeInfo', []);

tx.transferObjects([tx.object(thing1), tx.object(thing2)], RECEIVER_ADDRESS);
tx.moveCall({ target, arguments, typeArguments });

// pass parameters to the transaction from numbers or strings
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(100)]);
tx.transferObjects([coin], tx.pure.address('0xSomeSuiAddress'));
tx.pure('vector<u8>', [1, 2, 3]),
tx.pure('option<u8>', 1),
tx.pure('option<u8>', null),
tx.pure('vector<option<u8>>', [1, null, 2]),

// tx.object automatically converts the object ID to receiving transaction arguments if the moveCall expects it
tx.moveCall({
 	target: '0xSomeAddress::example::receive_object',
 	arguments: [tx.object('0xParentObjectID'), tx.object('0xReceivingObjectID')],
});

// clock y random
tx.object.clock();
tx.object.random();

// guardar lo devuelto x una funcion y pasarlo como parametro a otra
const [nft1, nft2] = tx.moveCall({ target: '0x2::nft::mint_many' });
tx.transferObjects([nft1, nft2], address);

