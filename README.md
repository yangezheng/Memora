# 🧠 Memora

**Memora** turns personal memories into on-chain 3D scenes you can own, revisit, and share — all secured with NFTs. A memory is uploaded, transformed, stored permanently via IPFS, and tokenized on Ethereum.

---

## 🚀 What It Does

- ✍️ Upload your memory (video + text)
- 🧊 Convert to a 3D Gaussian Splat
- 🧾 Store the `.ply` and metadata to IPFS (via Lighthouse)
- 🪙 Mint an NFT with the memory's CID
- 🔗 Anyone can see the 3D scene, only the NFT owner can unlock the full context (AI chat, metadata, etc.)

---

## 🎮 Demo Features

### 🔐 NFT Ownership Experience
When you connect your wallet to the Memora frontend, you'll experience:

- **🎉 Automatic Ownership**: The first memory (Zion National Park) becomes yours for demo purposes
- **👑 Visual Indicators**: Owned memories show crown icons and "YOURS"/"OWNED" badges
- **🔒 Preview Mode**: Non-owned memories show lock icons and "Preview" labels
- **✨ Different Access Levels**: 
  - **Owned NFTs**: Full HD 3D quality, enhanced controls, AI chat access
  - **Non-owned NFTs**: Preview mode with limited quality and features

### 🌟 3D Viewer Experience
- **LumaSplats Integration**: Real Gaussian splat rendering using Luma AI technology
- **Ownership-Based Access**: Different viewing experiences based on NFT ownership
- **Fallback System**: Graceful degradation to Three.js if LumaSplats fails to load
- **Responsive Controls**: Fullscreen, camera reset, info panels

### 📊 Blockscout Integration
The frontend integrates the [Blockscout SDK](https://docs.blockscout.com/devs/blockscout-sdk) for comprehensive blockchain explorer functionality:

- **🔔 Transaction Notifications**: Real-time toast notifications for transaction status
- **📜 Transaction History**: Interactive popup showing wallet transaction history
- **🔗 Explorer Links**: Direct links to Blockscout explorer for transactions and addresses
- **🌐 API Integration**: Uses Blockscout's `/tokens/{address_hash}/instances` endpoint to fetch real NFT data
- **⛓️ Multi-chain Support**: Configured for Ethereum Sepolia testnet with automatic network switching
- **💫 Real-time Updates**: Live transaction status tracking and blockchain data synchronization

#### Blockscout Features Implemented:
- **NFT Data Fetching**: Automatically loads real NFT instances from deployed contracts
- **Transaction Toast Notifications**: Shows pending, success, and error states with detailed info
- **Wallet Transaction History**: Browse recent transactions with status indicators and explorer links
- **Smart Network Handling**: Auto-switches to Sepolia and adds network if not present
- **Explorer Integration**: All transaction hashes link directly to Blockscout Sepolia explorer

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
