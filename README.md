### running service

```shell
## run in development
npm run dev

## build
npm run build

## start server with pm2
npm start

## pm2 stop all
npm stop

## logging
pm2 log
```

### extracting block data and trasaction data

```js
// http://221.148.71.114:26657/block?height=77256
const blockData = {
  jsonrpc: "2.0",
  id: -1,
  result: {
    block_id: {
      hash: "97085D07DD30F8BB177E457C468543465B8B48E82507295BC186177C5290D459",
      parts: {
        total: 1,
        hash: "9429589F476789D32F20EDF5274B15673B7DD40AA0C94B75369C453EBC5EE150",
      },
    },
    block: {
      header: {
        version: {
          block: "11",
        },
        chain_id: "uclid-devnet",
        height: "77256",
        time: "2024-06-03T08:38:37.99566437Z",
        last_block_id: {
          hash: "F79AC5D701B829241F95DA91279CA9788BFCF44F5334B19AA43AACCE26D57A6E",
          parts: {
            total: 1,
            hash: "565ABEB64C5F167E054C65A51CD3930F008780817B3114AE55FABC5836522027",
          },
        },
        last_commit_hash:
          "8C1A9433D919B4BCDB1A865594D445F6D3CCD5C0BC69959EC0CA5911F295E9EE",
        data_hash:
          "A405986E10F8F204F7A9EC6E151758F4090BC573A2D13F24048E5181104F8C8F",
        validators_hash:
          "14311DCD90106C09D628DDB2C736AF63CA8A9E2CFDDC01685885A9673634C34B",
        next_validators_hash:
          "14311DCD90106C09D628DDB2C736AF63CA8A9E2CFDDC01685885A9673634C34B",
        consensus_hash:
          "048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F",
        app_hash:
          "CCE6EFFC98F9A8808B17C19156495C86E4B20F30D82BA7EC901F6E83695BC5D2",
        last_results_hash:
          "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
        evidence_hash:
          "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
        proposer_address: "3B1998FE75CFA0DBC7A392B8F14FA1C68329CA8D",
      },
      data: {
        txs: [
          "Co8BCowBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmwKLHVjbGlkMXo4aG00dXgybWg4NWRuOGE5a3o5MDBqZHY4NTVhNHZwNmRsM2tkEix1Y2xpZDFneGQ2am5kODAyMmFzdTA4NnpuMnYzemVrZzN2a21qazJ2MHJ6ehoOCgR1Y2xpEgYxMDAwMDASaApQCkYKHy9jb3Ntb3MuY3J5cHRvLnNlY3AyNTZrMS5QdWJLZXkSIwohAwtE2nStJaDwVCqNWME509pSI7m4vSa3Qy8FoX9E9WrTEgQKAggBGAISFAoOCgR1Y2xpEgYxMDAwMDAQoI0GGkD9VMCZu7SXE5/QuLD0Q0PABZqd9jibPxC6EXCB8NefMhy4QlB2HMq/Mp2MVYDAk/5b/jW8xv/JHgACk2fCbVtn",
        ],
      },
      evidence: {
        evidence: [],
      },
      last_commit: {
        height: "77255",
        round: 0,
        block_id: {
          hash: "F79AC5D701B829241F95DA91279CA9788BFCF44F5334B19AA43AACCE26D57A6E",
          parts: {
            total: 1,
            hash: "565ABEB64C5F167E054C65A51CD3930F008780817B3114AE55FABC5836522027",
          },
        },
        signatures: [
          {
            block_id_flag: 2,
            validator_address: "3B1998FE75CFA0DBC7A392B8F14FA1C68329CA8D",
            timestamp: "2024-06-03T08:38:37.964279343Z",
            signature:
              "ieILitnMLuA3BEUHioqZY2flU8kVCCTgiVL18SKOBvgfJjjMQZvSJciJhPKjFgJWj5Zy3P6jUfOXFI3tk6NBDw==",
          },
          {
            block_id_flag: 2,
            validator_address: "80FD98D0BDE1AEF4BF1C42EC74B5240DD2AB31AC",
            timestamp: "2024-06-03T08:38:37.99566437Z",
            signature:
              "1uRb2p7NFvFp0/fPKjwDysEIhhKY/VT00AmePNr3t5sQau85yO/sA2I5Ei12DcjCBZPzPqI/zAr/j/4ioH0yAA==",
          },
          {
            block_id_flag: 2,
            validator_address: "D227B382FEA34DE8C25DDC8DECB75FBD7E0B0982",
            timestamp: "2024-06-03T08:38:38.063248851Z",
            signature:
              "h1Ztoyv1NMR1aXvyzlvZePkrLJKmKVexTQJNdOdY0LGs+SVOFEJL/e+bDsvKt15RmboRKQJuzuFcibKiwnJ4BQ==",
          },
        ],
      },
    },
  },
};

// txs 배열에서 첫 번째 트랜잭션 데이터 추출
const encodedTx = blockData.result.block.data.txs[0];

// base64로 디코딩
const decodedTx = Uint8Array.from(atob(encodedTx), (c) => c.charCodeAt(0));

// 트랜잭션 해시 계산 (SHA-256)
crypto.subtle
  .digest("SHA-256", decodedTx)
  .then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const txHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 트랜잭션 해시 출력
    console.log(`Transaction Hash: 0x${txHash}`);

    // http://221.148.71.114:26657/tx?hash=0x84b3092e8d5e12da340fc144b7e4ba35ad03d1fd14e7d711d3754a52c8c096c2&prove=true
  })
  .catch((error) => {
    console.error("Error calculating hash:", error);
  });
```
