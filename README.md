# 🧠 Memora – Where Real Humans Preserve Real Memories

**Memora** is a minimalist Web3 app for creating verifiable, permanent digital memories.  
Each memory is tied to a real person (via World App), stored forever (via Filecoin), and publicly tracked (via Blockscout).  
No hype, just permanence.

---

## 📸 What It Does

- 📹 Upload a short personal video
- 🔐 Authenticate with World App (proves you’re human)
- 🧠 Convert video to a 3D Gaussian Splat
- 📦 Upload the output to Filecoin (via Lighthouse)
- 🪪 Link each memory to your World ID & wallet
- 🔍 Log the memory on-chain and show TX status with Blockscout SDK

```
        ┌─────────────────────┐
        │  User opens app     │
        └─────────────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │ World App MiniKit Auth     │ ◄────── ON-CHAIN ✅
     │ - Calls `getUser()`        │
     │ - Gets World ID + wallet   │
     └────────────────────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │ User uploads video         │ ◄────── OFF-CHAIN
     │ - via Next.js form         │
     └────────────────────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │ Backend Upload to Filecoin │ ◄────── OFF-CHAIN
     │ - via Lighthouse SDK       │
     │ - gets CID + deal ID       │
     └────────────────────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │ Log CID to smart contract  │ ◄────── ON-CHAIN ✅
     │ - Stores wallet + CID      │
     │ - Emits event              │
     └────────────────────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │ Blockscout SDK watches TX  │ ◄────── ON-CHAIN ✅
     │ - Shows TX status live     │
     └────────────────────────────┘
```

---

## 🎯 Why It Matters

In a world of AI spam, fake users, and disappearing platforms, Memora offers a simple, human promise:

> **This moment was real. I was there. And it’s stored forever.**

We preserve not just data — but context, identity, and memory.

---

## 🛠 Tech Stack (MVP)

- ✅ **Next.js** frontend
- ✅ `@worldcoin/minikit` → verify real users
- ✅ `@lighthouse-web3/sdk` → store on Filecoin
- ✅ `@blockscout/sdk` → show TX status (CID logging)
- ✅ Simple Solidity contract → logs memory CIDs

---

## 🚀 Hackathon Challenge Integrations

### 🌍 World App – **Best Mini App** ($10K)

- Uses `getUser()` from MiniKit to verify real humans
- Links each memory to a **World ID + wallet**
- Validates proof in the backend
- Can run fully inside World App as a Mini App

✅ Qualifies fully

---

### 📁 Protocol Labs – **Filecoin Fair Data Economy** ($5K)

- Stores content using Lighthouse → real Filecoin storage deals
- Links Filecoin CID to **human-authenticated identity**
- Promotes transparent, verifiable, and user-owned memories

✅ Qualifies fully

---

### 🔍 Blockscout – **SDK & Explorer Challenge** ($6K + $10K Pool)

- Logs Filecoin CID on-chain with a simple contract
- Uses Blockscout SDK to show **real-time TX feedback**
- All explorer links route to Blockscout

✅ Qualifies for:
- SDK prize
- Explorer pool
- Potential merits use (future stretch)

---

## 🏗 Project Structure

```
/pages
    upload.tsx ← Upload UI + World ID auth
/api
    upload.ts ← Filecoin upload endpoint
/lib
    world.ts ← MiniKit integration
    blockscout.ts ← TX watcher helper
/contracts
    StorageLogger.sol ← CID logger (deployed to World Chain)
```



---


> **Memora** – Your memory. Your proof. Forever.