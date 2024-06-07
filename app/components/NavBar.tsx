"use client";
import Link from "next/link";
import { useWalletData } from "../data/wallet";
import { useBalanceData } from "../data/balance";
import { DENOM_SYMBOL, EVM_NATIVE_COIN_SYMBOL } from "../lib/wallet";

const NavBar = () => {
  const { walletData, connectWallet } = useWalletData();
  const { balanceData } = useBalanceData(walletData);
  console.log(balanceData?.balance);

  return (
    <nav className="h-24 py-6 px-8 mx-4 flex items-center border-solid border-b-2 border-slate-200">
      <div className="grow-0 flex items-center">
        <cite className="not-italic text-2xl">UCLID Hub</cite>
        <ul className="flex ml-20 gap-6">
          <li>
            <Link href="/faucet">Faucet</Link>
          </li>
          <li>
            <Link href="/transfer">Transfer</Link>
          </li>
          <li>
            <Link href="/explorer">Explorer</Link>
          </li>
          <li>
            <Link href="/light-app">Light App</Link>
          </li>
        </ul>
      </div>
      <div className="grow flex justify-end">
        {!walletData?.address && (
          <button
            onClick={connectWallet}
            className="bg-slate-950 hover:bg-slate-700 text-white py-2 px-4 rounded"
          >
            Connect
          </button>
        )}
        {walletData?.address && walletData?.evmAddress && (
          <div className="flex gap-2">
            <div className="flex flex-col gap-2">
              <div>
                {walletData.evmAddress.slice(0, 6)}...
                {walletData.evmAddress.slice(-5)}
              </div>
              <div>
                {walletData.address.slice(0, 11)}...
                {walletData.address.slice(-5)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                {balanceData?.evmBalance}
                {EVM_NATIVE_COIN_SYMBOL}
              </div>
              <div>
                {balanceData?.balance}
                {DENOM_SYMBOL}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
