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
    <nav className="lg:h-24 py-6 px-8 mx-4 flex lg:items-center lg:flex-row flex-col border-solid border-b-2 border-slate-200">
      <div className="grow-0 flex lg:flex-row flex-col lg:items-center">
        <cite className="not-italic text-2xl lg:mb-0 mb-6">UCLID Hub</cite>
        <ul className="flex lg:ml-20 lg:gap-6 gap-4 lg:flex-row flex-col">
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
            <Link href="/probe-node">Probe Node</Link>
          </li>
        </ul>
      </div>
      <div className="grow flex lg:justify-end justify-start lg:mt-0 mt-6">
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
            <div className="flex flex-col lg:gap-2 gap-1">
              <small>
                {walletData.evmAddress.slice(0, 6)}...
                {walletData.evmAddress.slice(-5)}
              </small>
              <small>
                {walletData.address.slice(0, 11)}...
                {walletData.address.slice(-5)}
              </small>
            </div>
            <div className="flex flex-col lg:gap-2 gap-1">
              <small>
                {balanceData?.evmBalance}
                &nbsp;{EVM_NATIVE_COIN_SYMBOL}
              </small>
              <small>
                {balanceData?.balance}
                &nbsp;{DENOM_SYMBOL}
              </small>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
