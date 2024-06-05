"use client";
import React, { useState } from "react";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import * as bip39 from "bip39";
import { wordlist } from "./wordlist";

const WalletPage: React.FC = () => {
  const [entropy, setEntropy] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const getSignedMessage = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      const message = `purchase-${Math.random().toString(36).substring(2)}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });
      return signature;
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const generateEntropy = async () => {
    const signature = await getSignedMessage();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(signature)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const entropy = `prv-${hashHex}`;
    setEntropy(entropy);
    return entropy;
  };

  const encryptEntropy = async (entropy: string, password: string) => {
    const encodedEntropy = new TextEncoder().encode(entropy);
    const encodedPassword = new TextEncoder().encode(password);

    const keyData = await crypto.subtle.digest("SHA-256", encodedPassword);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedEntropy
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    };
  };

  const decryptEntropy = async (encryptedData: any, password: string) => {
    const encodedPassword = new TextEncoder().encode(password);

    const keyData = await crypto.subtle.digest("SHA-256", encodedPassword);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  };

  const handleGenerateEntropy = async () => {
    await generateEntropy();
  };

  const handleEncryptAndStore = async () => {
    if (entropy && password) {
      const encryptedData = await encryptEntropy(entropy, password);
      localStorage.setItem("encryptedEntropy", JSON.stringify(encryptedData));
      alert("Entropy has been encrypted and stored.");
    } else {
      alert("Please generate or enter entropy and enter password.");
    }
  };

  const handleLoadAndDecrypt = async () => {
    const encryptedData = JSON.parse(
      localStorage.getItem("encryptedEntropy") || "{}"
    );
    if (encryptedData && password) {
      const decryptedEntropy = await decryptEntropy(encryptedData, password);
      setEntropy(decryptedEntropy);
    } else {
      alert("No encrypted entropy found or password is empty.");
    }
  };

  const handleCheckAddress = async () => {
    if (entropy) {
      let finalEntropy = entropy.replace("prv-", "");
      if (finalEntropy.length % 2 !== 0) {
        finalEntropy = "0" + finalEntropy;
      }

      const mnemonic = bip39.entropyToMnemonic(finalEntropy, wordlist);
      console.log(mnemonic);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "uclid",
      });
      const [account] = await wallet.getAccounts();
      console.log(account.address);
      setAddress(`Address: ${account.address}`);
    } else {
      alert("Please decrypt entropy first.");
    }
  };

  return (
    <div>
      <h1>Cosmos AppChain Mnemonic Generation</h1>
      <button onClick={handleGenerateEntropy}>Generate Entropy</button>
      <input
        type="text"
        placeholder="Or enter entropy here"
        value={entropy}
        onChange={(e) => setEntropy(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleEncryptAndStore}>Encrypt and Store Entropy</button>
      <button onClick={handleLoadAndDecrypt}>Load and Decrypt Entropy</button>
      <button onClick={handleCheckAddress}>Check Address</button>
      <div>{address}</div>
    </div>
  );
};

export default WalletPage;
