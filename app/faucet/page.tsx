"use client";
import {
  FormEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWalletData } from "../data/wallet";

import bech32 from "bech32";
import SuccessToast from "../components/Toast";

const FaucetPage = () => {
  const addressRef = useRef() as MutableRefObject<HTMLInputElement>;
  const { walletData } = useWalletData();
  const [requested, setRequested] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  function isValidBech32Address(address: string): boolean {
    try {
      const decoded = bech32.decode(address);
      const prefix = decoded.prefix;
      const data = decoded.words;

      console.log(data);
      return prefix === "uclid" && data.length == 32;
    } catch (error) {
      return false;
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const toAddress = addressRef.current.value;
    console.log(toAddress);
    if (!toAddress) {
      return alert("Enter your address");
    }

    if (!isValidBech32Address(toAddress)) {
      return alert("Enter valid address");
    }

    fetch("/api/faucet", {
      method: "POST",
      headers: { "content-type": "application-json" },
      body: JSON.stringify({ toAddress }),
    });

    // addressRef.current.value = "";

    setRequested(true);
    timeoutRef.current = setTimeout(() => {
      setRequested(false);
    }, 2100);
  };

  useEffect(() => {
    addressRef.current.value = walletData ? walletData.address : "";
  }, [walletData]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="flex flex-col items-center">
      <section className="text-center mt-16 lg:w-2/4 w-full lg:px-0 px-4">
        <header className="text-3xl">UCLID HUB PRENET FAUCET</header>
        <p className="text-base text-slate-500 mt-2">
          Fast and reliable. 0.1 CLI/address
        </p>
        <form
          className="flex mt-16 gap-2 lg:flex-row flex-col"
          onSubmit={handleSubmit}
        >
          <input
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700"
            type="text"
            placeholder="Enter Your Address, (uclid1....)"
            ref={addressRef}
            disabled={requested}
          />
          <button
            disabled={requested}
            className="lg:w-40 w-full bg-transparent hover:bg-slate-950 text-slate-700 font-semibold hover:text-white py-2 px-4 border border-slate-400 hover:border-transparent rounded"
          >
            Send Me CLI
          </button>
        </form>
      </section>
      <div className="flex justify-center mt-8">
        <SuccessToast show={requested} />
      </div>
    </main>
  );
};

export default FaucetPage;
