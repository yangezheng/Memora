# 🧠 Memora

**Memora** turns personal memories into on-chain 3D scenes you can own, revisit, and share — all secured with NFTs. A memory is uploaded, transformed, stored permanently via IPFS, and tokenized on Ethereum.

---

## 🚀 What It Does

- ✍️ Upload your memory (video + text)
- 🧊 Convert to a 3D Gaussian Splat
- 🧾 Store the `.ply` and metadata to IPFS (via Lighthouse)
- 🪙 Mint an NFT with the memory’s CID
- 🔗 Anyone can see the 3D scene, only the NFT owner can unlock the full context (AI chat, metadata, etc.)

---

## 🛠 Tech Stack

| Layer       | Tool / Protocol            |
|-------------|----------------------------|
| Frontend    | Next.js, ethers.js         |
| Storage     | IPFS via Lighthouse SDK    |
| NFT Minting | Solidity (ERC-721), Foundry |
| Explorer    | Blockscout (Sepolia)       |

---

## 🎯 Challenge Tracks

### 🧿 Blockscout Explorer Track — ✅ Qualified
- Deployed contract on Sepolia
- Using Blockscout as primary explorer in UI
- Contract verifiable on Blockscout
- Plan to show transaction feedback

### 🖼 NFT & Tokenization — ✅ Qualified
- Each memory is minted as an NFT
- Token contains IPFS CID to access memory content
- Ownership determines access to full metadata and context

---

## 🧪 How It Works (User Flow)

1. **User Uploads**: Video + Text
2. **Backend Processes**: Converts to `.ply`, generates `metadata.json`
3. **Storage**: Uploads to IPFS via Lighthouse → returns CID
4. **Smart Contract**: Mints NFT → links to CID
5. **Access**: NFT holder unlocks context, AI chat, 3D renderer

---

## 🧾 Example NFT Metadata

```json
{
  "name": "Memory #42",
  "description": "Hiking in Zion National Park — sunny, 2024",
  "animation_url": "ipfs://<CID>/scene.ply",
  "attributes": [
    { "trait_type": "location", "value": "Zion" },
    { "trait_type": "emotion", "value": "Inspired" }
  ]
}
