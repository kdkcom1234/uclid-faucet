import * as bip39 from "https://cdn.jsdelivr.net/npm/bip39@3.1.0/+esm";
import { sha256 } from "https://cdn.jsdelivr.net/npm/js-sha256@0.11.0/+esm";
import { DirectSecp256k1HdWallet } from "https://cdn.jsdelivr.net/npm/@cosmjs/proto-signing@0.32.3/+esm";
import { StargateClient } from "https://cdn.jsdelivr.net/npm/@cosmjs/stargate@0.32.3/+esm";
import { wordlist } from "./wordlist.js"; // 단어 리스트를 불러옵니다.

// sha256 해시 함수를 bip39에 전달합니다.
// bip39.setDefaultWordlist(wordlist);
bip39.mnemonicToEntropy = (mnemonic, wordlist) => {
  if (typeof wordlist === "undefined") {
    throw new Error("A wordlist is required but a default could not be found.");
  }
  const words = mnemonic.split(" ");
  if (words.length % 3 !== 0) {
    throw new Error("Invalid mnemonic.");
  }
  // Convert words to entropy
  let entropyBits = "";
  for (const word of words) {
    const index = wordlist.indexOf(word);
    if (index === -1) {
      throw new Error("Invalid mnemonic word.");
    }
    entropyBits += index.toString(2).padStart(11, "0");
  }
  const dividerIndex = Math.floor(entropyBits.length / 33) * 32;
  const entropy = entropyBits.substring(0, dividerIndex);
  const checksumBits = entropyBits.substring(dividerIndex);

  // Convert entropy to bytes
  const entropyBytes = Uint8Array.from(
    entropy.match(/.{1,8}/g).map((byte) => parseInt(byte, 2))
  );
  // Calculate the checksum and compare
  const newChecksum = sha256(entropyBytes)[0];
  if (
    checksumBits !==
    newChecksum.toString(2).padStart(8, "0").substring(0, checksumBits.length)
  ) {
    throw new Error("Invalid mnemonic checksum.");
  }
  return entropyBytes;
};

async function getSignedMessage() {
  if (typeof ethereum !== "undefined") {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    const message = `purchase-${Math.random().toString(36).substring(2)}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });
    return signature;
  } else {
    alert("MetaMask is not installed!");
  }
}

async function generateEntropy() {
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
  document.getElementById("entropyDisplay").innerText = entropy;
  document.getElementById("entropyInput").value = entropy;
  return entropy;
}

async function encryptEntropy(entropy, password) {
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
}

async function decryptEntropy(encryptedData, password) {
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
}

document
  .getElementById("generateEntropy")
  .addEventListener("click", async () => {
    const entropy = await generateEntropy();
    console.log("Generated Entropy:", entropy);
  });

document
  .getElementById("encryptAndStore")
  .addEventListener("click", async () => {
    let entropy = document.getElementById("entropyDisplay").innerText;
    if (!entropy) {
      entropy = document.getElementById("entropyInput").value;
    }
    const password = document.getElementById("password").value;

    if (entropy && password) {
      const encryptedData = await encryptEntropy(entropy, password);
      localStorage.setItem("encryptedEntropy", JSON.stringify(encryptedData));
      alert("Entropy has been encrypted and stored.");
    } else {
      alert("Please generate or enter entropy and enter password.");
    }
  });

document
  .getElementById("loadAndDecrypt")
  .addEventListener("click", async () => {
    const encryptedData = JSON.parse(localStorage.getItem("encryptedEntropy"));
    const password = document.getElementById("password").value;

    if (encryptedData && password) {
      const entropy = await decryptEntropy(encryptedData, password);
      document.getElementById("entropyDisplay").innerText = entropy;
      document.getElementById("entropyInput").value = entropy;
    } else {
      alert("No encrypted entropy found or password is empty.");
    }
  });

document.getElementById("checkBalance").addEventListener("click", async () => {
  let entropy = document.getElementById("entropyDisplay").innerText;
  if (!entropy) {
    entropy = document.getElementById("entropyInput").value;
  }

  if (entropy) {
    let finalEntropy = entropy.replace("prv-", "");

    // Ensure the entropy length is correct
    if (finalEntropy.length % 2 !== 0) {
      finalEntropy = "0" + finalEntropy;
    }

    const mnemonic = bip39.entropyToMnemonic(finalEntropy, wordlist);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "uclid",
    });
    const [account] = await wallet.getAccounts();
    const rpcEndpoint = "http://221.148.71.114:26657"; // 코스모스 RPC 엔드포인트 (포트 26657 포함)
    const client = await StargateClient.connect(rpcEndpoint);

    const balance = await client.getBalance(account.address, "ucli"); // 적절한 코인 타입으로 변경
    document.getElementById(
      "balanceDisplay"
    ).innerText = `Balance: ${balance.amount} ${balance.denom}`;
  } else {
    alert("Please decrypt entropy first.");
  }
});
