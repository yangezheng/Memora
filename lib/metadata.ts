// NFT Metadata generation service
export interface MemoryMetadata {
  name: string
  description: string
  image: string
  animation_url: string
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
  properties?: {
    files: Array<{
      uri: string
      type: string
    }>
    category: string
  }
}

export interface MemoryUploadData {
  name: string
  description: string
  location: string
  emotion: string
  tags: string[]
  videoFile: File
  textContent: string
  timestamp: string
}

// Generate NFT metadata according to OpenSea standards
export function generateMemoryMetadata(
  uploadData: MemoryUploadData,
  ipfsCid: string
): MemoryMetadata {
  const metadata: MemoryMetadata = {
    name: uploadData.name,
    description: uploadData.description,
    image: `ipfs://${ipfsCid}/preview.png`, // Thumbnail/preview image
    animation_url: `ipfs://${ipfsCid}/scene.ply`, // 3D scene file
    external_url: `https://memora.app/memory/${ipfsCid}`,
    attributes: [
      {
        trait_type: "Location",
        value: uploadData.location
      },
      {
        trait_type: "Emotion",
        value: uploadData.emotion
      },
      {
        trait_type: "Type",
        value: "3D Memory"
      },
      {
        trait_type: "Creation Date",
        value: uploadData.timestamp
      },
      {
        trait_type: "Format",
        value: "Gaussian Splat"
      },
      ...uploadData.tags.map(tag => ({
        trait_type: "Tag",
        value: tag
      }))
    ],
    properties: {
      files: [
        {
          uri: `ipfs://${ipfsCid}/scene.ply`,
          type: "model/ply"
        },
        {
          uri: `ipfs://${ipfsCid}/preview.png`,
          type: "image/png"
        },
        {
          uri: `ipfs://${ipfsCid}/memory.txt`,
          type: "text/plain"
        },
        {
          uri: `ipfs://${ipfsCid}/metadata.json`,
          type: "application/json"
        }
      ],
      category: "3D Memory NFT"
    }
  }

  return metadata
}

// Create metadata JSON file content
export function createMetadataFile(metadata: MemoryMetadata): string {
  return JSON.stringify(metadata, null, 2)
}

// Validate metadata according to standards
export function validateMetadata(metadata: MemoryMetadata): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!metadata.name || metadata.name.trim().length === 0) {
    errors.push("Name is required")
  }

  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push("Description is required")
  }

  if (!metadata.image || !metadata.image.startsWith('ipfs://')) {
    errors.push("Image must be a valid IPFS URL")
  }

  if (!metadata.animation_url || !metadata.animation_url.startsWith('ipfs://')) {
    errors.push("Animation URL must be a valid IPFS URL")
  }

  if (!metadata.attributes || metadata.attributes.length === 0) {
    errors.push("At least one attribute is required")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate preview text for memory
export function generateMemoryPreview(uploadData: MemoryUploadData): string {
  return `Memory: ${uploadData.name}

Description: ${uploadData.description}

Location: ${uploadData.location}
Emotion: ${uploadData.emotion}
Tags: ${uploadData.tags.join(', ')}

Created: ${uploadData.timestamp}

Content:
${uploadData.textContent}

---
This memory was captured and transformed into a 3D NFT using Memora.
Original video processed into Gaussian splat format for immersive viewing.
`
} 