"use client";
import {
  BrowserProvider,
  Contract,
  ContractTransactionResponse,
  parseEther,
} from "ethers";
import { PROBE_NODE_ABI } from "../lib/abi/probeNode";
import { useWalletData } from "../data/wallet";
import { BaseContract } from "ethers";
import { useEffect, useState } from "react";

interface IProbeNodeContract extends BaseContract {
  mint(
    opsAddress: string,
    mintingFee: { value: bigint }
  ): Promise<ContractTransactionResponse>;
}

const ProbePage = () => {
  const { walletData } = useWalletData();
  const handlePurchase = async () => {
    if (!walletData?.address) {
      alert("Connect Wallet");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(
      // contract address
      "0x37300F3adbB637FE05561e589eA9AD832ed80539",
      // contract ABI
      PROBE_NODE_ABI,
      provider
    );
    console.log(contract);

    const contractSigner = contract.connect(signer) as IProbeNodeContract;
    const txn = await contractSigner.mint(walletData!.address, {
      value: parseEther("0.001"),
    });
    console.log(txn);

    const receipt = await txn.wait();
    console.log(receipt);
  };

  useEffect(() => {
    (async () => {
      if (window.ethereum && walletData?.evmAddress) {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
          // contract address
          "0x37300F3adbB637FE05561e589eA9AD832ed80539",
          // contract ABI
          PROBE_NODE_ABI,
          provider
        );

        const tokens = await contract.getTokensByAddress(walletData.evmAddress);
        for (let token of tokens) {
          const [id, address, opsAddress, uri] = token;
          console.log(id, address, opsAddress, uri);
        }
      }
    })();
  }, [walletData]);

  return (
    <main className="flex flex-col items-center">
      <header className="text-3xl mt-16">Probe Node Operation</header>
      <section className="text-center lg:w-2/4 w-full lg:px-0 px-4">
        <div className="flex justify-end">
          <button
            onClick={handlePurchase}
            className="flex justify-center items-center lg:w-40 w-full bg-transparent hover:bg-slate-950 text-slate-700 font-semibold hover:text-white py-2 px-4 border border-slate-400 hover:border-transparent rounded"
          >
            Purchase
          </button>
        </div>
        <ul>
          <li></li>
        </ul>
      </section>
    </main>
  );
};

export default ProbePage;
