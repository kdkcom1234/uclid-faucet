"use client";
import Link from "next/link";
import { useWalletData } from "../data/wallet";

const NavBar = () => {
  const { walletData, connectWallet } = useWalletData();

  return (
    <nav className="h-28 pt-10 pb-6 px-8 mx-4 flex items-center border-solid border-b-2 border-slate-200">
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
        {walletData?.address && (
          <span>
            {walletData.address.slice(0, 11)}...
            {walletData.address.slice(-5)}
          </span>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
