#!/usr/bin/env node

import lighthouse from '@lighthouse-web3/sdk'
import path from 'path'
import fs from 'fs/promises'
import { createReadStream } from 'fs'

// Configuration
const apiKey = process.env.LIGHTHOUSE_API_KEY || '332779b9.ca97ac19292a4bfaaf462ca93ed5b3e3'

// Memory upload script for backend processing
async function uploadMemoryToIPFS(options = {}) {
  const {
    folderPath,
    memoryName = 'Untitled Memory',
    description = 'A cherished memory captured in 3D',
    location = 'Unknown Location',
    emotion = 'Nostalgic',
    tags = [],
    textContent = '',
    generateMetadata = true
  } = options

  console.log('🚀 Starting memory upload to IPFS...')
  console.log(`📁 Source folder: ${folderPath}`)

  try {
    // Validate folder exists
    const folderStats = await fs.stat(folderPath)
    if (!folderStats.isDirectory()) {
      throw new Error(`${folderPath} is not a directory`)
    }

    // Check for required files
    const files = await fs.readdir(folderPath)
    console.log(`📋 Found files: ${files.join(', ')}`)

    // Generate metadata if requested
    if (generateMetadata) {
      console.log('📝 Generating NFT metadata...')
      
      const metadata = {
        name: memoryName,
        description: description,
        image: `ipfs://PLACEHOLDER_CID/preview.png`,
        animation_url: `ipfs://PLACEHOLDER_CID/scene.ply`,
        external_url: `https://memora.app/memory/PLACEHOLDER_CID`,
        attributes: [
          {
            trait_type: "Location",
            value: location
          },
          {
            trait_type: "Emotion", 
            value: emotion
          },
          {
            trait_type: "Type",
            value: "3D Memory"
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString().split('T')[0]
          },
          {
            trait_type: "Format",
            value: "Gaussian Splat"
          },
          ...tags.map(tag => ({
            trait_type: "Tag",
            value: tag
          }))
        ],
        properties: {
          files: [
            {
              uri: `ipfs://PLACEHOLDER_CID/scene.ply`,
              type: "model/ply"
            },
            {
              uri: `ipfs://PLACEHOLDER_CID/preview.png`, 
              type: "image/png"
            },
            {
              uri: `ipfs://PLACEHOLDER_CID/memory.txt`,
              type: "text/plain"
            },
            {
              uri: `ipfs://PLACEHOLDER_CID/metadata.json`,
              type: "application/json"
            }
          ],
          category: "3D Memory NFT"
        }
      }

      // Write metadata.json to folder
      const metadataPath = path.join(folderPath, 'metadata.json')
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      console.log(`✅ Created metadata.json`)

      // Write memory text file if provided
      if (textContent) {
        const memoryTextPath = path.join(folderPath, 'memory.txt')
        const fullText = `Memory: ${memoryName}

Description: ${description}

Location: ${location}
Emotion: ${emotion}
Tags: ${tags.join(', ')}

Created: ${new Date().toISOString().split('T')[0]}

Content:
${textContent}

---
This memory was captured and transformed into a 3D NFT using Memora.
Original video processed into Gaussian splat format for immersive viewing.`
        
        await fs.writeFile(memoryTextPath, fullText)
        console.log(`✅ Created memory.txt`)
      }
    }

    // Upload folder to IPFS via Lighthouse
    console.log('⬆️ Uploading to IPFS via Lighthouse...')
    const response = await lighthouse.upload(folderPath, apiKey, false)
    const cid = response.data.Hash

    console.log('✅ Upload complete!')
    console.log('📦 CID:', cid)
    console.log(`🔗 Gateway: https://gateway.lighthouse.storage/ipfs/${cid}`)
    console.log(`📄 Metadata: ipfs://${cid}/metadata.json`)
    console.log(`🎬 Scene: ipfs://${cid}/scene.ply`)
    console.log(`🖼️ Preview: ipfs://${cid}/preview.png`)

    // Update metadata with real CID
    if (generateMetadata) {
      console.log('🔄 Updating metadata with final CID...')
      
      const metadataPath = path.join(folderPath, 'metadata.json')
      const metadataContent = await fs.readFile(metadataPath, 'utf8')
      const updatedMetadata = metadataContent.replace(/PLACEHOLDER_CID/g, cid)
      await fs.writeFile(metadataPath, updatedMetadata)
      
      // Re-upload with corrected metadata
      const finalResponse = await lighthouse.upload(folderPath, apiKey, false)
      const finalCid = finalResponse.data.Hash
      
      if (finalCid !== cid) {
        console.log('🔄 Final CID with corrected metadata:', finalCid)
        return finalCid
      }
    }

    return cid

  } catch (error) {
    console.error('❌ Error uploading memory:', error)
    throw error
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
Usage: node upload-memory.js <folder_path> [options]

Options:
  --name "Memory Name"          Name for the memory NFT
  --description "Description"   Description of the memory
  --location "Location"         Where the memory took place
  --emotion "Emotion"           Emotion associated with the memory
  --tags "tag1,tag2,tag3"      Comma-separated tags
  --text "Text content"         Full text content of the memory
  --no-metadata                Skip metadata generation

Example:
  node upload-memory.js memory-files/ethglobal \\
    --name "Sunset at Zion" \\
    --description "Beautiful hiking experience" \\
    --location "Zion National Park" \\
    --emotion "Inspired" \\
    --tags "hiking,nature,sunset" \\
    --text "The most incredible sunset I've ever seen..."
`)
    process.exit(1)
  }

  const folderPath = args[0]
  const options = { folderPath }

  // Parse options
  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i]
    const value = args[i + 1]

    switch (flag) {
      case '--name':
        options.memoryName = value
        break
      case '--description':
        options.description = value
        break
      case '--location':
        options.location = value
        break
      case '--emotion':
        options.emotion = value
        break
      case '--tags':
        options.tags = value.split(',').map(tag => tag.trim())
        break
      case '--text':
        options.textContent = value
        break
      case '--no-metadata':
        options.generateMetadata = false
        i-- // No value for this flag
        break
    }
  }

  try {
    const cid = await uploadMemoryToIPFS(options)
    console.log(`\n🎉 Success! Memory uploaded with CID: ${cid}`)
    process.exit(0)
  } catch (error) {
    console.error(`\n💥 Failed to upload memory: ${error.message}`)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { uploadMemoryToIPFS } 