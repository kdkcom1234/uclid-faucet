import useSWR from "swr";
import { getEvmAddress, getWalletAddresFromEvmSignature, switchToPolygonAmoyNetwork } from "../lib/wallet";


export interface IWalletData {
  address: string;
  evmAddress: string;
}

export const useWalletData = () => {
  const { data: walletData, mutate } = useSWR<IWalletData>("@data/wallet");

  const connectWallet = () => {
    mutate(async () => {

      const evmAddress = await getEvmAddress()
      await switchToPolygonAmoyNetwork();

      const address = await getWalletAddresFromEvmSignature();

      return {
        address,
        evmAddress,
      } as IWalletData;
    });
  };

  return { walletData, connectWallet };
};