# 🧠 Memora – Meet Me in a Memory

> A way for people to meet me — at a moment in time, in the place I was, as I was.

Memora is a Web3-powered memory capsule that lets users preserve real moments in time through 3D reconstructed video, permanent decentralized storage, and human verification. Built on top of World ID, Filecoin, and Blockscout, Memora enables verified memories to live on-chain and be recalled, explored, and queried forever.

---

## 🌐 What Is Memora?

Memora lets users:

* Upload a short **video** + **contextual journal**
* Reconstruct the moment as a **3D Gaussian Splat**
* Authenticate as a **real person** using World ID
* Store the experience **permanently** via Filecoin
* Log its presence **on-chain** and make it **verifiable**
* Talk to an **AI twin** trained on your memories

---

## 🔄 User Flow

1. Visit Memora
2. Log in with World ID (via MiniKit)
3. Upload video + journal description
4. (Optional) Scene is reconstructed as 3D Gaussian Splat
5. Bundle is stored on Filecoin (via Lighthouse)
6. CID is logged on-chain via smart contract
7. User can revisit the memory or query it with AI later

---

## 💡 Key Technologies

| Layer       | Tech Used                          |
| ----------- | ---------------------------------- |
| Identity    | World App + MiniKit SDK            |
| Storage     | Filecoin (via Lighthouse SDK)      |
| On-chain    | World Chain + Blockscout SDK       |
| Frontend    | Next.js, Node.js                   |
| Scene Gen   | Gaussian Splatting (offline)       |
| AI (future) | RAG over embedded journal metadata |

---

## 🏆 Hackathon Tracks

### 🌍 World App

* Verified user identity with MiniKit
* Secure real-human memory linkage

### 📁 Protocol Labs / Filecoin

* Permanent memory storage via Lighthouse
* Memory provenance and CID on-chain

### 🔍 Blockscout

* Live TX visibility with SDK
* Human-readable memory provenance

---

## ✨ Why It Matters

Memora preserves not just files, but presence:

* Who you were
* What you saw
* Where you stood
* How you felt

Stored forever, verified on-chain, and ready for AI to learn from.

> Build your digital twin, one memory at a time.

---

## 🔍 Project Structure

```
/pages
  upload.tsx       ← Upload UI + World ID login
/api
  upload.ts        ← Filecoin upload handler
/lib
  world.ts         ← MiniKit helper
  blockscout.ts    ← TX confirmation UI
/contracts
  MemoryLogger.sol ← On-chain CID logger
```

---

## 🚀 Coming Next

* Public profiles and memory galleries
* Enhanced scene customization
* AI memory search and timeline playback
* On-chain memory linking between friends/family

---

## 🌟 Taglines

> Memora – Meet me in a memory.
> Memora – Your presence, preserved.
> Memora – A memory worth remembering.

---

## 📜 License

MIT
