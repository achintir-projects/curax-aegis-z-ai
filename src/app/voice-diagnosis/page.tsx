'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Stop,
  Send,
  User,
  Bot,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface AudioLevel {
  level: number
  timestamp: number
}

export default function VoiceDiagnosis() {
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI medical assistant. Please describe your symptoms, and I'll help you understand what might be going on. You can speak naturally, and I'll listen carefully.",
      timestamp: new Date(Date.now() - 30000),
      status: 'sent'
    }
  ])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [audioLevels, setAudioLevels] = useState<AudioLevel[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
      } catch (error) {
        console.error('Error initializing audio:', error)
      }
    }

    initAudio()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  // Simulate audio level visualization
  const startAudioVisualization = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateAudioLevels = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
      const normalizedLevel = Math.min(100, (average / 128) * 100)

      setAudioLevels(prev => {
        const newLevels = [...prev, { level: normalizedLevel, timestamp: Date.now() }]
        // Keep only last 50 levels
        return newLevels.slice(-50)
      })

      animationRef.current = requestAnimationFrame(updateAudioLevels)
    }

    updateAudioLevels()
  }

  const startListening = async () => {
    try {
      setIsListening(true)
      setConnectionStatus('connecting')
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setConnectionStatus('connected')
      startAudioVisualization()
      
      // Simulate real-time transcription
      const simulateTranscription = () => {
        if (!isListening) return
        
        // This would be replaced with actual STT API call
        const phrases = [
          "I've been experiencing a sharp pain in my chest",
          "It started yesterday morning and it's getting worse",
          "I also have a shortness of breath",
          "The pain is worse when I take deep breaths"
        ]
        
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
        setCurrentTranscript(prev => prev + (prev ? ' ' : '') + randomPhrase)
        
        if (Math.random() > 0.7) {
          // Stop transcription randomly
          stopListening()
        } else {
          setTimeout(simulateTranscription, 2000 + Math.random() * 3000)
        }
      }
      
      setTimeout(simulateTranscription, 1000)
      
    } catch (error) {
      console.error('Error starting listening:', error)
      setIsListening(false)
      setConnectionStatus('disconnected')
    }
  }

  const stopListening = async () => {
    setIsListening(false)
    setIsProcessing(true)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    // Add user message to conversation
    if (currentTranscript.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: currentTranscript,
        timestamp: new Date(),
        status: 'sending'
      }
      
      setConversation(prev => [...prev, userMessage])
      
      // Simulate API processing
      setTimeout(() => {
        // Update message status to sent
        setConversation(prev => 
          prev.map(msg => 
            msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
          )
        )
        
        // Generate AI response
        const aiResponses = [
          "I understand you're experiencing chest pain with shortness of breath. These symptoms could indicate several conditions, ranging from minor issues to more serious concerns. I'd recommend seeking immediate medical attention, especially since the pain is worsening and accompanied by breathing difficulties.",
          "Based on your description of sharp chest pain that worsens with deep breathing, this could be related to your lungs, chest wall, or even your heart. The combination with shortness of breath is particularly important to have evaluated by a healthcare professional right away.",
          "Thank you for describing your symptoms. Chest pain with shortness of breath should always be taken seriously. While I'm not a replacement for professional medical care, I would strongly recommend you visit an emergency room or call emergency services, especially since these symptoms started recently and are getting worse."
        ]
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          timestamp: new Date(),
          status: 'sent'
        }
        
        setConversation(prev => [...prev, aiResponse])
        setIsProcessing(false)
        setCurrentTranscript('')
        
        // Simulate text-to-speech
        if (!isMuted) {
          setIsPlaying(true)
          setTimeout(() => setIsPlaying(false), 5000)
        }
      }, 2000)
    } else {
      setIsProcessing(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = (status?: 'sending' | 'sent' | 'error') => {
    switch (status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  const renderWaveform = () => {
    if (audioLevels.length === 0) return null

    const maxLevel = Math.max(...audioLevels.map(l => l.level), 1)
    
    return (
      <div className="flex items-end space-x-1 h-16">
        {audioLevels.map((level, index) => (
          <div
            key={index}
            className="w-1 bg-emerald-500 rounded-t transition-all duration-100"
            style={{
              height: `${(level.level / maxLevel) * 100}%`,
              opacity: isListening ? 1 : 0.3
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Voice Diagnosis</h1>
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'connecting' ? 'secondary' : 'destructive'}
              >
                {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className="flex items-center space-x-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
              
              <Button variant="outline" size="sm">
                Save Session
              </Button>
              
              <Button variant="outline" size="sm">
                End Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Conversation Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Medical Consultation</CardTitle>
                <CardDescription>
                  Speak naturally about your symptoms. The AI will listen and respond with medical guidance.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-3 max-w-[80%] ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                              {getStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {currentTranscript && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">{currentTranscript}</p>
                            <div className="flex items-center mt-2">
                              <Loader2 className="w-3 h-3 animate-spin text-blue-500 mr-1" />
                              <span className="text-xs text-blue-600">Listening...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                              <span className="text-sm text-gray-600">Analyzing symptoms...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={conversationEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Audio Visualization */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Audio Input</span>
                    <div className="flex items-center space-x-2">
                      {isListening && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-600">Recording</span>
                        </div>
                      )}
                      {isPlaying && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Speaking</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {renderWaveform()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Controls</CardTitle>
                <CardDescription>Manage your voice session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-full ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" disabled={!isPlaying}>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" disabled={!isPlaying}>
                    <Stop className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>Current consultation details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium">5:32</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages</span>
                  <span className="text-sm font-medium">{conversation.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Model</span>
                  <span className="text-sm font-medium">Med-PaLM 2</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  View Vital Signs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Session History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Emergency Contacts
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Speak clearly and at a moderate pace</p>
                <p>• Describe symptoms in detail</p>
                <p>• Mention when symptoms started</p>
                <p>• Include any relevant medical history</p>
                <p>• Work in a quiet environment</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}