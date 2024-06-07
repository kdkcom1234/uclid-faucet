import useSWR from "swr";
import { IWalletData } from "./wallet";
import { createWalletClient } from "../lib/wallet";
import { BrowserProvider } from "ethers";

interface IBalanceData {
  balance: string;
  evmBalance: string;
}

const BALANCE_INIT = { balance: "0", evmBalance: "0" } as IBalanceData


const fetchBalance = async (walletData?: IWalletData) => {

  if (walletData) {
    const { address, evmAddress } = walletData;

    // uclid
    const client = createWalletClient();
    const res = await client.CosmosBankV1Beta1.query.queryBalance(address, { denom: "ucli" });
    const quotient = BigInt(res.data.balance!.amount!) / BigInt(1000000);
    const remainder = BigInt(res.data.balance!.amount!) % BigInt(1000000);
    const balance = `${quotient}.${remainder == BigInt(0) ? "000000" : remainder}`;

    // evm
    const provider = new BrowserProvider(window.ethereum);
    const evmBalanceFull = await provider.getBalance(evmAddress);
    const quotientEvm = evmBalanceFull / BigInt("1000000000000000000");
    const remainderEvm = evmBalanceFull % BigInt("1000000000000000000");
    const evmBalance = `${quotientEvm}.${remainderEvm == BigInt(0) ? "000000" : remainderEvm.toString().slice(0, 6)}`;

    return {
      balance,
      evmBalance
    } as IBalanceData
  }
  return { ...BALANCE_INIT } as IBalanceData;
}

export const useBalanceData = (walletData?: IWalletData) => {
  const { data: balanceData } = useSWR<IBalanceData>(walletData ? "@data/balance" : null,
    () => fetchBalance(walletData),
    { refreshInterval: 3000, fallbackData: { ...BALANCE_INIT } });

  return { balanceData };
}