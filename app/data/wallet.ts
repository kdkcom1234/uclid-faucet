import useSWR from "swr";
import { Client } from "../../../uclid-tsclient";
import { AccountData } from "@cosmjs/proto-signing";
import { IgniteClient } from "../../../uclid-tsclient/client";

const client = new Client({
  apiURL: `${process.env.NEXT_PUBLIC_NODE_API_URL}`,
  rpcURL: `${process.env.NEXT_PUBLIC_NODE_RPC_URL}`,
  prefix: "uclid",
});

const keplrConfig = {
  stakeCurrency: {
    coinDenom: "CLI",
    coinMinimalDenom: "ucli",
    coinDecimals: 6,
  },
  currencies: [
    {
      coinDenom: "CLI",
      coinMinimalDenom: "ucli",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "CLI",
      coinMinimalDenom: "ucli",
      coinDecimals: 6,
    },
  ],
  chainName: "UCLID Hub Devnet",
}

interface IWalletData {
  client: typeof client;
  address: string
}

export const useWalletData = () => {
  const { data: walletData, mutate } = useSWR<IWalletData>("@data/wallet");

  const connectWallet = () => {
    mutate(async () => {
      let account: AccountData | undefined;

      console.log("---window.keplr---");
      console.log(window.keplr);
      if (!window.keplr) {
        window.location.href = "https://www.keplr.app/download";
        return { client, address: account ? account.address : "" } as IWalletData
      }

      try {
        await client.useKeplr(keplrConfig);
        if (client.signer) {
          const accounts = await client.signer?.getAccounts();
          account = accounts ? accounts[0] : undefined;
          console.log(account);
        }
      } catch (e: any) {
        alert(e.message);
      }

      return { client, address: account ? account.address : "" } as IWalletData
    })
  }

  return { walletData, connectWallet }
}

