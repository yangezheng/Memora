import lighthouse from '@lighthouse-web3/sdk'

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '2990024c.40dc50bbe7b94ffdb01c97f9943ae55d'

export interface MemoryMetadata {
  name: string
  description: string
  location: string
  emotion: string
  createdAt: string
  owner?: string
}

export interface UploadResult {
  cid: string
  url: string
}

export async function uploadMemoryToIPFS(
  videoFile: File,
  metadata: MemoryMetadata
): Promise<UploadResult> {
  try {
    // Create form data for upload
    const formData = new FormData()
    formData.append('file', videoFile)
    
    // Create metadata file
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    })
    formData.append('metadata', metadataBlob, 'metadata.json')

    // Upload to Lighthouse
    const response = await lighthouse.upload(formData, LIGHTHOUSE_API_KEY)
    
    const cid = response.data.Hash
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`

    return { cid, url }
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw new Error('Failed to upload to IPFS')
  }
}

export async function getMemoryFromIPFS(cid: string): Promise<any> {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching from IPFS:', error)
    throw new Error('Failed to fetch from IPFS')
  }
}

export function getIPFSUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`
}

export async function uploadFolderToIPFS(folderPath: string): Promise<UploadResult> {
  try {
    const response = await lighthouse.upload(folderPath, LIGHTHOUSE_API_KEY)
    const cid = response.data.Hash
    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`
    
    return { cid, url }
  } catch (error) {
    console.error('Error uploading folder to IPFS:', error)
    throw new Error('Failed to upload folder to IPFS')
  }
} 