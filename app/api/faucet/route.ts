// import { Client } from "../../../../uclid-tsclient"
import { IgniteClient } from "../../../../uclid-tsclient/client"
import { IgntModule as CosmosBankV1Beta1 } from '../../../../uclid-tsclient/cosmos.bank.v1beta1'
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";


// mage1z8hm4ux2mh85dn8a9kz900jdv855a4vps65egr
const faucetMnemonic =
  "upgrade weekend letter main drink mail elbow sausage wild pistol journey attract focus permit acoustic gap decade sound clump brand great range fine round";

export async function POST(req: Request) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(faucetMnemonic, { prefix: "mage" });
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
}