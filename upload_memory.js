import lighthouse from '@lighthouse-web3/sdk';
import path from 'path';

// const apiKey = 'YOUR_LIGHTHOUSE_API_KEY'; // Replace this with your API key
const apiKey = '332779b9.ca97ac19292a4bfaaf462ca93ed5b3e3';

const upload = async () => {
  const folderPath = path.join('memory-files/ethglobal'); // Folder with .ply and .png

  const response = await lighthouse.upload(folderPath, apiKey, 'memory_upload');
  const cid = response.data.Hash;

  console.log('✅ Upload complete!');
  console.log('📦 CID:', cid);
  console.log(`🔗 Access: https://gateway.lighthouse.storage/ipfs/${cid}`);
  console.log(`📄 scene.ply: ipfs://${cid}/scene.ply`);
  console.log(`🖼️ preview.png: ipfs://${cid}/preview.png`);
};

upload();
