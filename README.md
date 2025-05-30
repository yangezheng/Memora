# 🧠 Memora – Meet Me in a Memory

> “A way for people to meet me — at a moment in time, in the place I was, as I was.”

**Memora** is your personal memory capsule.  
You don’t just upload a file — you preserve an experience.  
Others can revisit it. And your future self — or your AI — can remember it.

---

## 🌐 What Is Memora?

Memora lets real humans record and preserve memories that are:

- Authenticated with a real-world identity (World ID)  
- Rendered in immersive 3D (via Gaussian Splatting)  
- Stored permanently on decentralized infrastructure (Filecoin)  
- Verifiably linked to the person and time (on-chain via Blockscout)

> Not just a journal. Not just an NFT.  
> A moment — **anchored in time, space, and identity**.

---

## 🧭 How It Works

### 👤 For Users

1. **Visit the Memora website**  
2. **Log in using World App (World ID)**  
3. **Upload your memory**  
   - A short video  
   - A journal note: where, what, how you felt  
4. **Scene is recreated** *(optional)*  
   - 3D Gaussian Splat generated from your video  
5. **Your memory is stored**  
   - Uploaded to Filecoin via Lighthouse  
   - 3D scene + text bundled and pinned  
6. **Logged on-chain**  
   - Filecoin CID and your wallet logged via smart contract  
7. **Revisit your memories**  
   - Return to Memora to replay your experiences  
8. **Talk to your AI twin** *(future)*  
   - Ask: “What was I doing in spring 2025?”

---

### 🛠 For Developers (Technical Flow)

| Step | Layer             | Tech / Stack                                        |
|------|-------------------|------------------------------------------------------|
| 1    | Auth              | `@worldcoin/minikit` (`getUser()`) for World ID     |
| 2    | Upload            | `Next.js` frontend, `Node.js` API handler           |
| 3    | 3D Conversion     | Offline Gaussian Splatting tool (e.g. PyTorch)      |
| 4    | Bundling          | Combine `.splat` file + `.json` metadata            |
| 5    | Storage           | `@lighthouse-web3/sdk` → Filecoin + deal receipt    |
| 6    | On-chain Logging  | `MemoryLogger.sol` logs CID + sender (World Chain)  |
| 7    | Feedback          | `@blockscout/sdk` for TX status + explorer links    |
| 8    | AI Search (*)     | RAG-style local embedding search over memory text   |

\* AI interaction is a future feature, not part of current MVP.

---

## 🏆 Hackathon Track Submissions

### 🌍 World App – **Best Mini App**

- Uses MiniKit SDK (`getUser`) for verified human identity  
- Associates memory with unique real person  
✅ Fully qualified

### 📁 Protocol Labs – **Fair Data Economy (Filecoin)**

- Uploads human-authenticated content to Filecoin via Lighthouse  
- Ensures data provenance, permanence, and transparency  
✅ Fully qualified

### 🔍 Blockscout – **SDK & Explorer Prize**

- Logs memory CID on-chain via contract  
- Displays TX confirmation with Blockscout SDK  
- All explorer links use Blockscout  
✅ Fully qualified

---

## ✨ Taglines

> **Memora** – Meet me in a memory  
> **Memora** – Build your digital twin, one moment at a time  
> **Memora** – Your presence, stored for the future

---

## 📂 Project Structure

```
/pages
    upload.tsx ← Upload UI + World ID login
/api
    upload.ts ← Filecoin upload handler
/lib
    world.ts ← MiniKit helper
    blockscout.ts ← TX confirmation UI
/contracts
    MemoryLogger.sol ← On-chain CID logger
```


---

## 🧪 Built With

- `Next.js`  
- `Worldcoin MiniKit SDK`  
- `Lighthouse SDK` (Filecoin)  
- `Blockscout SDK`  
- `Solidity` (deployed to World Chain)  
- Optional: `PyTorch` for Gaussian Splatting

---


> **Memora – Where real humans preserve real memories.**