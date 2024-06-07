import { ADDRESS_PREFIX, createWalletClient } from "@/app/lib/wallet";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

const client = createWalletClient();

export async function POST(req: Request) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.FAUCET_MNEMONIC!.toString(), { prefix: ADDRESS_PREFIX });
  client.useSigner(wallet);

  const fromAddress = (await wallet.getAccounts())[0].address;
  const body = await req.json();
  const toAddress = body.toAddress

  client.CosmosBankV1Beta1.tx.sendMsgSend({
    value: {
      fromAddress,
      toAddress,
      amount: [{ amount: "100000", denom: "ucli" }]
    }, fee: {
      amount: [{ amount: '100000', denom: 'ucli' }],
      gas: '100000',
    },
  }).catch(r => {
    console.log(`${new Date().toLocaleString()} | toAddress: ${toAddress}`)
    console.log(`${new Date().toLocaleString()} | ERROR: ${r.message}`)
  })

  return Response.json({})
  // return Response.json({ gasUsed: txRes.gasUsed.toString(), gasWanted: txRes.gasWanted.toString() })
}