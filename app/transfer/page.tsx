"use client";
import {
  FormEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWalletData } from "../data/wallet";
import SuccessToast from "../components/Toast";

const TransferPage = () => {
  const { walletData } = useWalletData();
  const [txHash, setTxHash] = useState<string>("");
  const addressRef = useRef() as MutableRefObject<HTMLInputElement>;
  const amountRef = useRef() as MutableRefObject<HTMLInputElement>;
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!walletData) {
      alert("Connect Wallet Please");
      return;
    }

    if (walletData) {
      const { client, address: fromAddress } = walletData;
      const toAddress = addressRef.current.value;

      if (!fromAddress) {
        alert("Connect Wallet Please");
        return;
      }

      if (!toAddress) {
        alert("Enter Recipient Address");
        return;
      }

      if (!amountRef.current.value) {
        alert("Enter Amount of CLI");
        return;
      }

      try {
        setLoading(true);
        const res = await client.CosmosBankV1Beta1.tx.sendMsgSend({
          value: {
            fromAddress,
            toAddress,
            amount: [
              {
                amount: (+amountRef.current.value * 1000000).toString(),
                denom: "ucli",
              },
            ],
          },
          // send gas consumption 60000 ~ 80000
          // min-gas-price = 1ucli
          // gas fee = 60000ucli ~ 80000ucli
          fee: {
            amount: [{ amount: "100000", denom: "ucli" }],
            gas: "100000",
          },
        });

        setRequested(true);
        setTxHash(res.transactionHash);

        timeoutRef.current = setTimeout(() => {
          setRequested(false);
        }, 2100);
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (walletData) {
      console.log(walletData.address);
    }
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
      <section className="text-center mt-16" style={{ width: "800px" }}>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700"
            type="text"
            placeholder="Recipient Address, (uclid1....)"
            ref={addressRef}
          />
          <input
            className="appearance-none border rounded py-2 px-3 text-gray-700"
            type="text"
            placeholder="Amount of CLI"
            ref={amountRef}
          />
          <button
            disabled={loading}
            className="flex justify-center items-center w-40 bg-transparent hover:bg-slate-950 text-slate-700 font-semibold hover:text-white py-2 px-4 border border-slate-400 hover:border-transparent rounded"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-slate-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {!loading && "Send"}
          </button>
        </form>
        <div className="text-left mt-2">
          <span>Transaction Hash: {txHash}</span>
        </div>
      </section>
      <div className="flex justify-center mt-8">
        <SuccessToast show={requested} />
      </div>
    </main>
  );
};

export default TransferPage;
