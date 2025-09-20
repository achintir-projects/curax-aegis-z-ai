import { NextRequest, NextResponse } from 'next/server'
import { createSpeechToTextService, defaultSTTConfig, medicalRecognitionConfig } from '@/lib/speech-to-text'
import { createTextToSpeechService, defaultTTSConfig, medicalVoiceConfig, defaultAudioConfig } from '@/lib/text-to-speech'

// Initialize services
const sttService = createSpeechToTextService(defaultSTTConfig)
const ttsService = createTextToSpeechService(defaultTTSConfig)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, audioData, text, voice, language } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'transcribe':
        return await handleTranscription(audioData, language)
      
      case 'transcribe-long':
        return await handleLongRunningTranscription(audioData, language)
      
      case 'synthesize':
        return await handleSynthesis(text, voice, language)
      
      case 'synthesize-ssml':
        return await handleSSMLSynthesis(text, voice, language)
      
      case 'synthesize-long':
        return await handleLongTextSynthesis(text, voice, language)
      
      case 'start-streaming':
        return await handleStartStreaming()
      
      case 'stop-streaming':
        return await handleStopStreaming()
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleLongRunningTranscription(audioData: any, language: string = 'en-US') {
  try {
    // Prepare recognition config for long-running audio
    const config = {
      ...medicalRecognitionConfig,
      languageCode: language
    }

    // Prepare audio data
    const audio = {
      content: audioData?.content || audioData // base64 encoded audio
    }

    // Perform long-running speech recognition
    const response = await sttService.recognizeLongRunning(audio, config)
    
    // Format the response for the client
    const result = {
      transcript: response.results[0]?.alternatives[0]?.transcript || '',
      confidence: response.results[0]?.alternatives[0]?.confidence || 0,
      language: language,
      alternatives: response.results[0]?.alternatives || [],
      duration: response.totalBilledTime || '0s',
      processingTime: Date.now(),
      requestId: response.requestId,
      isLongRunning: true
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Long-running speech transcription failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Long-running speech transcription failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleTranscription(audioData: any, language: string = 'en-US') {
  try {
    // Prepare recognition config with specified language
    const config = {
      ...medicalRecognitionConfig,
      languageCode: language
    }

    // Prepare audio data
    const audio = {
      content: audioData?.content || audioData // base64 encoded audio
    }

    // Perform speech recognition
    const response = await sttService.recognize(audio, config)
    
    // Format the response for the client
    const result = {
      transcript: response.results[0]?.alternatives[0]?.transcript || '',
      confidence: response.results[0]?.alternatives[0]?.confidence || 0,
      language: language,
      alternatives: response.results[0]?.alternatives || [],
      words: response.results[0]?.alternatives[0]?.words || [],
      duration: response.totalBilledTime || '0s',
      processingTime: Date.now(),
      requestId: response.requestId
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Speech transcription failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Speech transcription failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleSSMLSynthesis(ssml: string, voice: string = 'en-US-Standard-J', language: string = 'en-US') {
  if (!ssml) {
    return NextResponse.json(
      { error: 'SSML is required for synthesis' },
      { status: 400 }
    )
  }

  try {
    // Prepare voice configuration
    const voiceConfig = {
      ...medicalVoiceConfig,
      name: voice,
      languageCode: language
    }

    // Prepare audio configuration
    const audioConfig = {
      ...defaultAudioConfig
    }

    // Prepare synthesis input with SSML
    const input = {
      ssml: ssml
    }

    // Perform text-to-speech synthesis with SSML
    const response = await ttsService.synthesize(input, voiceConfig, audioConfig)
    
    // Format the response for the client
    const result = {
      audioContent: response.audioContent,
      audioUrl: response.audioUrl,
      voice: response.voice,
      audioConfig: response.audioConfig,
      timepoints: response.timepoints,
      duration: ttsService['estimateDuration']?.(ssml.replace(/<[^>]*>/g, ''), audioConfig) || 0,
      characters: ssml.length,
      isSSML: true,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('SSML text-to-speech synthesis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'SSML text-to-speech synthesis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleLongTextSynthesis(text: string, voice: string = 'en-US-Standard-J', language: string = 'en-US') {
  if (!text) {
    return NextResponse.json(
      { error: 'Text is required for synthesis' },
      { status: 400 }
    )
  }

  try {
    // Prepare voice configuration
    const voiceConfig = {
      ...medicalVoiceConfig,
      name: voice,
      languageCode: language
    }

    // Prepare audio configuration
    const audioConfig = {
      ...defaultAudioConfig
    }

    // Prepare synthesis input
    const input = {
      text: text
    }

    // Perform long text-to-speech synthesis
    const response = await ttsService.synthesizeLongText(input, voiceConfig, audioConfig)
    
    // Format the response for the client
    const result = {
      audioContent: response.audioContent,
      audioUrl: response.audioUrl,
      voice: response.voice,
      audioConfig: response.audioConfig,
      duration: ttsService['estimateDuration']?.(text, audioConfig) || 0,
      characters: text.length,
      isLongText: true,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Long text-to-speech synthesis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Long text-to-speech synthesis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleSynthesis(text: string, voice: string = 'en-US-Standard-J', language: string = 'en-US') {
  if (!text) {
    return NextResponse.json(
      { error: 'Text is required for synthesis' },
      { status: 400 }
    )
  }

  try {
    // Prepare voice configuration
    const voiceConfig = {
      ...medicalVoiceConfig,
      name: voice,
      languageCode: language
    }

    // Prepare audio configuration
    const audioConfig = {
      ...defaultAudioConfig
    }

    // Prepare synthesis input
    const input = {
      text: text
    }

    // Perform text-to-speech synthesis
    const response = await ttsService.synthesize(input, voiceConfig, audioConfig)
    
    // Format the response for the client
    const result = {
      audioContent: response.audioContent,
      audioUrl: response.audioUrl,
      voice: response.voice,
      audioConfig: response.audioConfig,
      timepoints: response.timepoints,
      duration: ttsService['estimateDuration']?.(text, audioConfig) || 0,
      characters: text.length,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Text-to-speech synthesis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Text-to-speech synthesis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleStartStreaming() {
  // Simulate starting a streaming transcription session
  const sessionId = 'stream_' + Date.now()
  
  return NextResponse.json({
    success: true,
    result: {
      sessionId,
      status: 'streaming',
      message: 'Streaming transcription started',
      websocketUrl: `wss://api.curax.ai/voice/stream/${sessionId}`
    },
    timestamp: new Date().toISOString()
  })
}

async function handleStopStreaming() {
  // Simulate stopping a streaming transcription session
  return NextResponse.json({
    success: true,
    result: {
      status: 'stopped',
      message: 'Streaming transcription stopped'
    },
    timestamp: new Date().toISOString()
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'voices') {
      // Return available voices from TTS service
      const voices = await ttsService.listVoices()

      return NextResponse.json({
        success: true,
        result: { voices },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'languages') {
      // Return supported languages from STT service
      const languages = sttService.getSupportedLanguages()

      return NextResponse.json({
        success: true,
        result: { languages },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'models') {
      // Return supported models from STT service
      const models = sttService.getSupportedModels()

      return NextResponse.json({
        success: true,
        result: { models },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Voice API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}