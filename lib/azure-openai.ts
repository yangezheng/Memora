export interface AzureOpenAIConfig {
  endpoint: string
  deploymentName: string
  apiKey: string
}

export const azureConfig: AzureOpenAIConfig = {

  endpoint: "yourendpoint",
  deploymentName: "yourdeployanme",
  apiKey: "yourapi"
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{
    type: 'text' | 'input_audio'
    text?: string
    input_audio?: {
      data: string
      format: 'wav' | 'mp3'
    }
  }>
}

export async function sendAudioMessage(
  audioBlob: Blob,
  messages: ChatMessage[],
  memoryContext?: {
    name: string
    description: string
    isOwned: boolean
  }
): Promise<{ text: string; audio?: ArrayBuffer }> {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant in Memora, helping users explore their 3D Gaussian splat NFT memories.

CURRENT MEMORY: "ETH Global Prague Team Moment"
User owns this 3D memory NFT captured outside Cubex Centrum Praha.

HARDCODED CONTEXT - ETH Global Prague 2025:
- Dates: May 30 – June 1, 2025
- Venue: Cubex Centrum Praha, Na Strži 2097/63, Nusle, Prague
- Scale: 800+ attendees, 13+ protocols, 29+ workshops
- Prizes: $150,000 total (Blockscout $20k, 1inch $20k, LayerZero $10k, Protocol Labs $5k)
- User: Filming with Protocol Labs team outside venue
- Weather: Beautiful sunny Prague spring weather
- Vibe: Incredible hackathon energy, builders from worldwide
- Themes: ZK proofs, AI x Crypto, DeFi, Layer 2s, DevTools
- Tech: Memory preserved as 3D Gaussian splat NFT on-chain

CRITICAL: Respond in exactly 1-2 short sentences. No more. Be friendly but extremely brief.`
    }

    // Convert audio blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64Audio = btoa(Array.from(uint8Array, byte => String.fromCharCode(byte)).join(''))

    const userAudioMessage: ChatMessage = {
      role: 'user',
      content: [{
        type: 'input_audio',
        input_audio: {
          data: base64Audio,
          format: 'wav'
        }
      }]
    }

    const apiUrl = `${azureConfig.endpoint}openai/deployments/${azureConfig.deploymentName}/chat/completions?api-version=2024-10-01-preview`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureConfig.apiKey,
      },
      body: JSON.stringify({
        messages: [systemMessage, ...messages, userAudioMessage],
        max_tokens: 800,
        temperature: 0.7,
        modalities: ['text', 'audio'],
        audio: {
          voice: 'alloy',
          format: 'wav'
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('🔍 Full API Response:', JSON.stringify(data, null, 2))
    
    const textContent = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request."
    
    // Extract audio if present
    let audioBuffer: ArrayBuffer | undefined
    const audioContent = data.choices[0]?.message?.audio
    console.log('🔍 Audio content in response:', audioContent)
    
    if (audioContent?.data) {
      try {
        console.log('🔄 Processing audio data, length:', audioContent.data.length)
        const audioData = atob(audioContent.data)
        audioBuffer = new ArrayBuffer(audioData.length)
        const audioArray = new Uint8Array(audioBuffer)
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i)
        }
        console.log('✅ Audio buffer created, size:', audioBuffer.byteLength)
      } catch (audioError) {
        console.error('❌ Failed to process audio data:', audioError)
      }
    } else {
      console.log('⚠️ No audio data in API response')
    }

    return { 
      text: textContent,
      audio: audioBuffer
    }

  } catch (error) {
    console.error('Azure OpenAI Audio API error:', error)
    throw error
  }
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const apiUrl = `${azureConfig.endpoint}openai/deployments/tts/audio/speech?api-version=2024-10-01-preview`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureConfig.apiKey,
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy',
        response_format: 'mp3'
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error('TTS API error:', error)
    throw error
  }
}

// Keep the original function for fallback text conversations
export async function sendChatMessage(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  memoryContext?: {
    name: string
    description: string
    isOwned: boolean
  }
): Promise<string> {
  try {
    const systemMessage = {
      role: 'system' as const,
      content: `You are an AI assistant in Memora, helping users explore their 3D Gaussian splat NFT memories.

CURRENT MEMORY: "ETH Global Prague Team Moment"
User owns this 3D memory NFT captured outside Cubex Centrum Praha.

HARDCODED CONTEXT - ETH Global Prague 2025:
- Dates: May 30 – June 1, 2025
- Venue: Cubex Centrum Praha, Na Strži 2097/63, Nusle, Prague
- Scale: 800+ attendees, 13+ protocols, 29+ workshops
- Prizes: $150,000 total (Blockscout $20k, 1inch $20k, LayerZero $10k, Protocol Labs $5k)
- User: Filming with Protocol Labs team outside venue
- Weather: Beautiful sunny Prague spring weather
- Vibe: Incredible hackathon energy, builders from worldwide
- Themes: ZK proofs, AI x Crypto, DeFi, Layer 2s, DevTools
- Tech: Memory preserved as 3D Gaussian splat NFT on-chain

CRITICAL: Respond in exactly 1-2 short sentences. No more. Be friendly but extremely brief.`
    }

    const apiUrl = `${azureConfig.endpoint}openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureConfig.apiKey,
      },
      body: JSON.stringify({
        messages: [systemMessage, ...messages],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request."

  } catch (error) {
    console.error('Azure OpenAI API error:', error)
    throw error
  }
} 