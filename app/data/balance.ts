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
    const microDenomMultiplier = BigInt(1000000);
    const quotient = BigInt(res.data.balance!.amount!) / microDenomMultiplier;
    const remainder = BigInt(res.data.balance!.amount!) % microDenomMultiplier;
    const remainderString = remainder.toString().padStart(6, '0');
    const balance = `${quotient}.${remainderString}`;

    // evm
    const provider = new BrowserProvider(window.ethereum);
    const evmBalanceWei = await provider.getBalance(evmAddress);
    const etherUnit = BigInt(1e18);
    const evmBalanceEth = evmBalanceWei * BigInt(1e6) / etherUnit;
    const integerPart = evmBalanceEth / BigInt(1e6);
    const fractionalPart = evmBalanceEth % BigInt(1e6);

    const evmBalance = `${integerPart}.${fractionalPart.toString().padStart(6, '0')}`;

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