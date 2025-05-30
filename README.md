# 🧠 Memora

Memora is a minimal Web3-powered app that lets users turn their videos into 3D moments and store them permanently on Filecoin. It uses World App's MiniKit to verify real users and ensure each memory is uniquely tied to a human identity.

---

## 🔧 What It Does

- 📹 Upload a short 2D video  
- 🧠 (Offline) convert to a 3D Gaussian Splat  
- 🔐 Authenticate with World App (MiniKit)  
- 📦 Store the 3D output on Filecoin via Lighthouse  
- 🪪 Link upload to verified user (World ID + wallet)  
- 🔍 Log Filecoin storage on-chain and track it via Blockscout SDK  

---

## 🛠 Tech

- Next.js frontend  
- Lighthouse SDK for Filecoin storage  
- Worldcoin MiniKit SDK for authentication  
- Blockscout SDK for live transaction feedback  
- Simple Node.js API for uploads  

---

## ✅ Bounty Tracks

**Protocol Labs**  
→ Uses Filecoin (via Lighthouse) for decentralized storage of user-submitted content.

**World App Mini App**  
→ Uses MiniKit SDK and World ID to verify real users and associate each memory with a unique human.

**Blockscout**  
→ Integrates the Blockscout SDK to give users real-time feedback when their Filecoin storage record is logged on-chain.  
→ Also uses Blockscout as the default explorer for transaction links.  
→ Eligible for:
  - ✅ Best Blockscout SDK Integration ($3,000)
  - ✅ Blockscout Explorer Pool Prize ($10,000 shared)

---

## 📜 License

MIT
