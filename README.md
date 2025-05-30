# 🧠 Memora

Memora is a minimal Web3-powered app that lets users turn their videos into 3D moments and store them permanently on Filecoin. It uses World App's MiniKit to verify real users and ensure each memory is uniquely tied to a human identity.

---

## 🔧 What It Does

- 📹 Upload a short 2D video
- 🧠 (Offline) convert to a 3D Gaussian Splat
- 🔐 Authenticate with World App (MiniKit)
- 📦 Store the 3D output on Filecoin via Lighthouse
- 🪪 Link upload to verified user (World ID + wallet)

---

## 🛠 Tech

- Next.js frontend
- Lighthouse SDK for Filecoin storage
- Worldcoin MiniKit SDK for authentication
- Simple Node.js API for uploads

## ✅ Bounty Tracks

**Protocol Labs**: uses Filecoin for permanent storage

**World App Mini App**: uses MiniKit + World ID for user auth