import { IgniteClient } from "../../../../uclid-tsclient/client"
import { IgntModule as CosmosBankV1Beta1 } from '../../../../uclid-tsclient/cosmos.bank.v1beta1'
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export async function POST(req: Request) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.FAUCET_MNEMONIC!.toString(), { prefix: "uclid" });
  const Client = IgniteClient.plugin([CosmosBankV1Beta1])
  const client = new Client(
    {
      apiURL: "",
      rpcURL: "http://221.148.71.114:26657",
    },
    wallet
  );

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