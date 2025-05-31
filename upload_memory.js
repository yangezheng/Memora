import lighthouse from '@lighthouse-web3/sdk';
import axios from 'axios';
import path from 'path';

const apiKey = '2990024c.40dc50bbe7b94ffdb01c97f9943ae55d'; // your Lighthouse API key

const uploadFiles = async () => {
  const folderPath = path.join('memory-files/ethglobal');

  // Upload to IPFS via Lighthouse
  const response = await lighthouse.upload(folderPath, apiKey, "memora_memory_upload");
  const cid = response.data.Hash;

  console.log("✅ Upload complete!");
  console.log("📦 CID:", cid);
  console.log("🌐 URL: https://gateway.lighthouse.storage/ipfs/" + cid);

  // Trigger Filecoin storage deal
  const dealResponse = await axios.post(
    'https://api.lighthouse.storage/api/v0/deal/request',
    { cid },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  console.log("📝 Deal triggered successfully!");
  console.log("📃 Deal response:", dealResponse.data);
};

uploadFiles();
