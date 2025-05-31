# 🧠 Memora Frontend

A beautiful, modern Next.js frontend for the Memora project - transforming personal memories into on-chain 3D NFTs.

## 🚀 Features

- **Modern Design**: Beautiful glassmorphic UI with smooth animations
- **Wallet Integration**: Connect MetaMask and view wallet details
- **Memory Upload**: Drag & drop video upload with memory details
- **3D Gallery**: Browse and view community memories
- **IPFS Integration**: Secure storage via Lighthouse
- **Ethereum NFTs**: Mint memories as NFTs on Sepolia
- **Blockscout Explorer**: Direct links to transaction details

## 🛠 Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
Create a `.env.local` file with:
```bash
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your-lighthouse-api-key
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your-infura-key
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Open in Browser**
Navigate to http://localhost:3000

## 📁 Project Structure

```
├── app/                 # Next.js 13+ app directory
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main homepage
│   ├── globals.css     # Global styles with Tailwind
│   └── providers.tsx   # React context providers
├── components/         # Reusable React components
│   ├── UploadMemory.tsx     # Memory upload interface
│   ├── MemoryGallery.tsx    # Gallery display
│   └── WalletConnect.tsx    # Wallet connection
├── lib/                # Utility libraries
│   ├── utils.ts        # General utilities
│   └── lighthouse.ts   # IPFS/Lighthouse integration
└── ...config files
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **File Upload**: React Dropzone
- **3D**: Three.js + React Three Fiber
- **Storage**: IPFS via Lighthouse SDK
- **Blockchain**: ethers.js for Ethereum interaction
- **Notifications**: React Hot Toast

## 🚀 Key Components

### Home Page
- Hero section with beautiful animations
- Feature overview with "How It Works"
- Tech stack showcase
- Clean navigation

### Upload Memory
- Drag & drop video upload
- Memory details form (description, location, emotion)
- Progress tracking with visual feedback
- Success screen with IPFS and transaction links

### Memory Gallery
- Grid and list view modes
- Search and filter by emotion
- Sort by popularity, views, or date
- Interactive memory cards with hover effects
- Direct links to 3D scenes and blockchain explorer

### Wallet Connect
- MetaMask integration
- Address display and copying
- Balance and network information
- Blockscout explorer links
- Connect/disconnect functionality

## 🎯 Demo Features

The frontend includes sample data and mock functionality for demonstration:
- Sample memory gallery with beautiful images
- Simulated upload progress
- Mock IPFS CIDs and transaction hashes
- Responsive design for all screen sizes

## 🔧 Development

To modify the design or add features:

1. **Styling**: Edit Tailwind classes or `globals.css`
2. **Components**: Add new components in `/components`
3. **Pages**: Modify `/app/page.tsx` or add new routes
4. **Utils**: Add helpers in `/lib/utils.ts`
5. **IPFS**: Extend `/lib/lighthouse.ts` for storage features

## 🌐 Production Ready

The frontend is production-ready with:
- TypeScript for type safety
- Responsive design for mobile/desktop
- Error handling and loading states
- SEO-optimized metadata
- Performance optimized with Next.js

## 🎉 Getting Started

1. Install dependencies and start the dev server
2. Connect your MetaMask wallet
3. Try uploading a memory (uses mock data)
4. Browse the gallery and interact with memories
5. Experience the beautiful UI and smooth animations! 