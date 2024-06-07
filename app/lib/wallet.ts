import { Client } from "../../../uclid-tsclient";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import * as bip39 from "bip39";
import { sha256 } from "js-sha256";
import { wordlist } from "@/app/constants/wordlist";

/* !!!변경하면 지갑 바뀜 */
const SIGN_MESSAGE = "Sign to use the network";
export const ADDRESS_PREFIX = "uclid"
export const EVM_NATIVE_COIN_SYMBOL = "MATIC"
export const DENOM_SYMBOL = "CLI"
export const DENOM_MICRO_NAME = "ucli"

export const createWalletClient = () => {
  return new Client(
    {
      apiURL: `${process.env.NEXT_PUBLIC_NODE_API_URL}`,
      rpcURL: `${process.env.NEXT_PUBLIC_NODE_RPC_URL}`,
    },
    undefined
  );
}

export const getEvmAddress = async () => {
  let address = "";
  if (typeof window.ethereum !== "undefined") {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    address = accounts[0] as string;
  } else {
    alert("MetaMask is not installed!");
  }
  return address;
}

const getSignedMessage = async (evmAddress: string) => {
  let signature = "";
  if (typeof window.ethereum !== "undefined") {
    signature = (await window.ethereum.request({
      method: "personal_sign",
      params: [SIGN_MESSAGE, evmAddress],
    })) as string;
  } else {
    alert("MetaMask is not installed!");
  }

  return signature;
};

interface EthereumChain {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

const POLYGON_AMOY_NETWORK: EthereumChain = {
  chainId: '0x13882',
  chainName: 'Polygon Amoy Network',
  nativeCurrency: {
    name: EVM_NATIVE_COIN_SYMBOL,
    symbol: EVM_NATIVE_COIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};


export const switchToPolygonAmoyNetwork = async () => {
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  console.log(currentChainId)
  if (POLYGON_AMOY_NETWORK.chainId !== currentChainId) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POLYGON_AMOY_NETWORK],
        });
        console.log('Successfully switched to Polygon Amoy Network');
      } catch (error) {
        console.error('Failed to switch to the network:', error);
      }
    } else {
      console.error('MetaMask is not installed!');
    }
  }
}

const generateEntropy = async (signature: string) => {
  return sha256(signature);
};


/*
  서명메시지 + 메타마스크개인키
  = 서명값 -> sha256(256bit) -> entropy -> mnemonic -> 유클리드월렛(인메모리)
*/
const getWalletFromEvmSignature = async () => {
  const evmAddress = await getEvmAddress()
  const signature = await getSignedMessage(evmAddress);
  const entropy = await generateEntropy(signature);
  const mnemonic = bip39.entropyToMnemonic(entropy, wordlist);

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: ADDRESS_PREFIX,
  });

  return wallet;
}

export const getWalletAddresFromEvmSignature = async () => {
  const wallet = await getWalletFromEvmSignature()
  const [account] = await wallet.getAccounts();

  return account.address;
}

export const getWalletClientFromEvmSignature = async () => {
  const wallet = await getWalletFromEvmSignature()

  const client = createWalletClient();
  client.useSigner(wallet);

  return client;
}

