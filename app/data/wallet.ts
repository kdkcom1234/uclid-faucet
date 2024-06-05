import useSWR from "swr";
import { Client } from "../../../uclid-tsclient";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import * as bip39 from "bip39";
import { sha256 } from "js-sha256";
import { wordlist } from "@/app/constants/wordlist";

const SIGN_MESSAGE = "Sign for using UCLID Hub";

const getSignedMessage = async () => {
  let signature = "";
  let address = "";
  if (typeof window.ethereum !== "undefined") {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    address = accounts[0] as string;
    signature = (await window.ethereum.request({
      method: "personal_sign",
      params: [SIGN_MESSAGE, address],
    })) as string;
  } else {
    alert("MetaMask is not installed!");
  }

  return { signature, address };
};

const generateEntropy = async (signature: string) => {
  return sha256(signature);
};

const client = new Client(
  {
    apiURL: `${process.env.NEXT_PUBLIC_NODE_API_URL}`,
    rpcURL: `${process.env.NEXT_PUBLIC_NODE_RPC_URL}`,
  },
  undefined
);

interface IWalletData {
  client: typeof client;
  address: string;
  evmAddress: string;
}

export const useWalletData = () => {
  const { data: walletData, mutate } = useSWR<IWalletData>("@data/wallet");

  const connectWallet = () => {
    mutate(async () => {
      const { signature, address: evmAddress } = await getSignedMessage();
      let entropy = await generateEntropy(signature);
      if (entropy.length % 2 !== 0) {
        entropy = "0" + entropy;
      }

      const mnemonic = bip39.entropyToMnemonic(entropy, wordlist);
      console.log("Mnemonic:", mnemonic);

      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "uclid",
      });
      const [account] = await wallet.getAccounts();
      console.log("Address:", account.address);

      client.useSigner(wallet);

      client.CosmosBankV1Beta1.query
        .queryAllBalances(account.address)
        .then((result) => {
          console.log(result);
        });

      return {
        client,
        address: account ? account.address : "",
        evmAddress,
      } as IWalletData;
    });
  };

  return { walletData, connectWallet };
};
