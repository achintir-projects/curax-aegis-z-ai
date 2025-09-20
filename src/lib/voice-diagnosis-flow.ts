// Interactive Voice Diagnosis Flow Service
// This file manages the complete voice diagnosis conversation flow

interface VoiceSession {
  id: string
  patientId?: string
  startTime: Date
  status: 'active' | 'paused' | 'completed' | 'error'
  currentTurn: number
  messages: VoiceMessage[]
  context: SessionContext
  emergencyDetected: boolean
  confidence: number
}

interface VoiceMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
  transcription?: TranscriptionResult
  analysis?: AnalysisResult
}

interface TranscriptionResult {
  text: string
  confidence: number
  language: string
  duration: number
  words?: Array<{
    word: string
    startTime: number
    endTime: number
    confidence: number
  }>
}

interface AnalysisResult {
  intent: string
  entities: Array<{
    type: string
    value: string
    confidence: number
  }>
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  followUpQuestions: string[]
  confidence: number
}

interface SessionContext {
  symptoms: string[]
  duration: string
  severity: string
  location: string[]
  medicalHistory: string[]
  medications: string[]
  allergies: string[]
  demographicInfo: {
    age?: number
    gender?: string
  }
  assessment: {
    possibleConditions: Array<{
      condition: string
      probability: number
      description: string
    }>
    urgency: 'low' | 'medium' | 'high' | 'critical'
    recommendations: string[]
  }
}

interface ConversationFlow {
  currentState: 'greeting' | 'symptom_collection' | 'follow_up' | 'assessment' | 'recommendation' | 'closing'
  completedStates: string[]
  nextQuestions: string[]
  confidenceThreshold: number
}

class VoiceDiagnosisFlow {
  private sessions: Map<string, VoiceSession> = new Map()
  private flowConfig: {
    maxTurns: number
    confidenceThreshold: number
    emergencyKeywords: string[]
    followUpQuestionTemplates: Record<string, string[]>
  }

  constructor() {
    this.flowConfig = {
      maxTurns: 20,
      confidenceThreshold: 0.7,
      emergencyKeywords: [
        'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'severe bleeding',
        'unconscious', 'allergic reaction', 'overdose', 'suicide', 'emergency'
      ],
      followUpQuestionTemplates: {
        pain: [
          'Can you describe the pain? Is it sharp, dull, burning, or aching?',
          'On a scale of 1 to 10, how severe is the pain?',
          'When did the pain start?',
          'What makes the pain better or worse?'
        ],
        duration: [
          'How long have you been experiencing these symptoms?',
          'Are the symptoms constant or do they come and go?',
          'Have you had these symptoms before?'
        ],
        location: [
          'Where exactly do you feel the discomfort?',
          'Does the pain radiate to any other areas?',
          'Is the pain on one side or both sides?'
        ],
        associated: [
          'Do you have any other symptoms along with this?',
          'Have you noticed any changes in your appetite or sleep?',
          'Have you experienced any fever or chills?'
        ],
        medical: [
          'Do you have any pre-existing medical conditions?',
          'Are you currently taking any medications?',
          'Do you have any known allergies?'
        ]
      }
    }
  }

  async startSession(patientId?: string): Promise<VoiceSession> {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    const session: VoiceSession = {
      id: sessionId,
      patientId,
      startTime: new Date(),
      status: 'active',
      currentTurn: 0,
      messages: [],
      context: {
        symptoms: [],
        duration: '',
        severity: '',
        location: [],
        medicalHistory: [],
        medications: [],
        allergies: [],
        demographicInfo: {},
        assessment: {
          possibleConditions: [],
          urgency: 'low',
          recommendations: []
        }
      },
      emergencyDetected: false,
      confidence: 0
    }

    // Add greeting message
    const greetingMessage: VoiceMessage = {
      id: 'msg_' + Date.now(),
      type: 'assistant',
      content: 'Hello! I\'m your AI medical assistant. I\'m here to help understand your symptoms and provide guidance. Please describe what you\'re experiencing in your own words, and I\'ll ask some follow-up questions to better understand your situation.',
      timestamp: new Date()
    }

    session.messages.push(greetingMessage)
    this.sessions.set(sessionId, session)

    // Generate initial audio for greeting
    try {
      const audioResponse = await this.generateSpeech(greetingMessage.content)
      greetingMessage.audioUrl = audioResponse.audioUrl
    } catch (error) {
      console.warn('Failed to generate audio for greeting:', error)
    }

    return session
  }

  async processUserInput(
    sessionId: string,
    audioData?: string,
    textInput?: string
  ): Promise<{
    session: VoiceSession
    response: VoiceMessage
    actionRequired?: 'emergency' | 'follow_up' | 'continue' | 'complete'
  }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active')
    }

    try {
      // Step 1: Transcribe audio if provided
      let transcription: TranscriptionResult | undefined
      let userText = textInput

      if (audioData) {
        transcription = await this.transcribeAudio(audioData)
        userText = transcription.text
      }

      if (!userText) {
        throw new Error('No input provided')
      }

      // Step 2: Check for emergency keywords
      const emergencyCheck = this.checkForEmergency(userText)
      if (emergencyCheck.isEmergency) {
        session.emergencyDetected = true
        session.status = 'completed'
        
        const emergencyResponse = await this.generateEmergencyResponse(emergencyMatch.reason)
        const emergencyMessage: VoiceMessage = {
          id: 'msg_' + Date.now(),
          type: 'assistant',
          content: emergencyResponse.content,
          timestamp: new Date(),
          audioUrl: emergencyResponse.audioUrl
        }
        
        session.messages.push(emergencyMessage)
        this.sessions.set(sessionId, session)

        return {
          session,
          response: emergencyMessage,
          actionRequired: 'emergency'
        }
      }

      // Step 3: Analyze user input
      const analysis = await this.analyzeUserInput(userText, session.context)

      // Step 4: Update session context
      this.updateSessionContext(session, analysis)

      // Step 5: Generate AI response
      const aiResponse = await this.generateAIResponse(userText, analysis, session)
      
      // Step 6: Generate speech for AI response
      let audioUrl: string | undefined
      try {
        const audioResponse = await this.generateSpeech(aiResponse.content)
        audioUrl = audioResponse.audioUrl
      } catch (error) {
        console.warn('Failed to generate audio for AI response:', error)
      }

      // Step 7: Create and add messages
      const userMessage: VoiceMessage = {
        id: 'msg_' + Date.now(),
        type: 'user',
        content: userText,
        timestamp: new Date(),
        transcription
      }

      const assistantMessage: VoiceMessage = {
        id: 'msg_' + (Date.now() + 1),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        audioUrl,
        analysis
      }

      session.messages.push(userMessage, assistantMessage)
      session.currentTurn += 1
      session.confidence = analysis.confidence

      // Step 8: Determine next action
      const actionRequired = this.determineNextAction(session, analysis)

      // Step 9: Update session status if needed
      if (actionRequired === 'complete' || session.currentTurn >= this.flowConfig.maxTurns) {
        session.status = 'completed'
        await this.generateFinalAssessment(session)
      }

      this.sessions.set(sessionId, session)

      return {
        session,
        response: assistantMessage,
        actionRequired
      }

    } catch (error) {
      console.error('Error processing user input:', error)
      session.status = 'error'
      this.sessions.set(sessionId, session)
      throw error
    }
  }

  private async transcribeAudio(audioData: string): Promise<TranscriptionResult> {
    try {
      // In production, this would call the STT service
      // For now, simulate transcription
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        text: "I've been experiencing chest pain for the past two days, and it's getting worse when I breathe deeply.",
        confidence: 0.94,
        language: 'en-US',
        duration: 8.5,
        words: [
          { word: "I've", startTime: 0.5, endTime: 0.8, confidence: 0.98 },
          { word: "been", startTime: 0.8, endTime: 1.1, confidence: 0.96 },
          { word: "experiencing", startTime: 1.1, endTime: 1.8, confidence: 0.92 }
        ]
      }
    } catch (error) {
      console.error('Audio transcription failed:', error)
      throw error
    }
  }

  private checkForEmergency(text: string): { isEmergency: boolean; reason?: string } {
    const lowerText = text.toLowerCase()
    
    for (const keyword of this.flowConfig.emergencyKeywords) {
      if (lowerText.includes(keyword)) {
        return {
          isEmergency: true,
          reason: `Emergency keyword detected: ${keyword}`
        }
      }
    }
    
    return { isEmergency: false }
  }

  private async analyzeUserInput(text: string, context: SessionContext): Promise<AnalysisResult> {
    try {
      // In production, this would use the AI inference engine
      // For now, simulate analysis
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const entities = this.extractEntities(text)
      const sentiment = this.analyzeSentiment(text)
      const urgency = this.determineUrgency(text, entities, sentiment)
      const followUpQuestions = this.generateFollowUpQuestions(text, context)
      
      return {
        intent: this.determineIntent(text),
        entities,
        sentiment,
        urgency,
        followUpQuestions,
        confidence: Math.random() * 0.3 + 0.7 // 70-100%
      }
    } catch (error) {
      console.error('Input analysis failed:', error)
      throw error
    }
  }

  private extractEntities(text: string): Array<{ type: string; value: string; confidence: number }> {
    const entities: Array<{ type: string; value: string; confidence: number }> = []
    const lowerText = text.toLowerCase()
    
    // Simple entity extraction (in production, use NLP)
    if (lowerText.includes('pain') || lowerText.includes('hurt')) {
      entities.push({ type: 'symptom', value: 'pain', confidence: 0.9 })
    }
    
    if (lowerText.includes('chest')) {
      entities.push({ type: 'location', value: 'chest', confidence: 0.85 })
    }
    
    if (lowerText.includes('two days') || lowerText.includes('2 days')) {
      entities.push({ type: 'duration', value: '2 days', confidence: 0.8 })
    }
    
    if (lowerText.includes('breathe') || lowerText.includes('breathing')) {
      entities.push({ type: 'symptom', value: 'breathing difficulty', confidence: 0.75 })
    }
    
    return entities
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'urgent' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('emergency') || lowerText.includes('severe') || lowerText.includes('urgent')) {
      return 'urgent'
    }
    
    if (lowerText.includes('pain') || lowerText.includes('hurt') || lowerText.includes('worse')) {
      return 'negative'
    }
    
    if (lowerText.includes('better') || lowerText.includes('improving')) {
      return 'positive'
    }
    
    return 'neutral'
  }

  private determineUrgency(text: string, entities: any[], sentiment: string): 'low' | 'medium' | 'high' | 'critical' {
    if (sentiment === 'urgent') return 'critical'
    if (sentiment === 'negative' && entities.some(e => e.type === 'symptom')) return 'high'
    if (sentiment === 'negative') return 'medium'
    return 'low'
  }

  private determineIntent(text: string): string {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('pain') || lowerText.includes('symptom')) {
      return 'report_symptom'
    }
    
    if (lowerText.includes('help') || lowerText.includes('what should')) {
      return 'seek_advice'
    }
    
    if (lowerText.includes('history') || lowerText.includes('before')) {
      return 'provide_history'
    }
    
    return 'general_conversation'
  }

  private generateFollowUpQuestions(text: string, context: SessionContext): string[] {
    const questions: string[] = []
    const entities = this.extractEntities(text)
    
    // Generate relevant follow-up questions based on extracted entities
    for (const entity of entities) {
      const templates = this.flowConfig.followUpQuestionTemplates[entity.type]
      if (templates) {
        questions.push(...templates.slice(0, 2)) // Add up to 2 questions per entity type
      }
    }
    
    // Add context-aware questions
    if (context.symptoms.length > 0 && !context.duration) {
      questions.push('How long have you been experiencing these symptoms?')
    }
    
    if (context.symptoms.length > 0 && context.location.length === 0) {
      questions.push('Where exactly are you experiencing these symptoms?')
    }
    
    return questions.slice(0, 3) // Return up to 3 questions
  }

  private updateSessionContext(session: VoiceSession, analysis: AnalysisResult): void {
    const context = session.context
    
    // Update symptoms from entities
    const symptomEntities = analysis.entities.filter(e => e.type === 'symptom')
    symptomEntities.forEach(entity => {
      if (!context.symptoms.includes(entity.value)) {
        context.symptoms.push(entity.value)
      }
    })
    
    // Update location from entities
    const locationEntities = analysis.entities.filter(e => e.type === 'location')
    locationEntities.forEach(entity => {
      if (!context.location.includes(entity.value)) {
        context.location.push(entity.value)
      }
    })
    
    // Update urgency
    context.assessment.urgency = analysis.urgency
    
    // Update confidence
    session.confidence = Math.max(session.confidence, analysis.confidence)
  }

  private async generateAIResponse(
    userInput: string,
    analysis: AnalysisResult,
    session: VoiceSession
  ): Promise<{ content: string }> {
    try {
      // In production, this would use the AI inference engine
      // For now, simulate response generation
      await new Promise(resolve => setTimeout(resolve, 800))
      
      let response = ''
      
      if (analysis.urgency === 'critical') {
        response = 'Based on what you\'ve described, I recommend seeking immediate medical attention. Your symptoms suggest this may be urgent. Please call emergency services or go to the nearest emergency room right away.'
      } else if (analysis.followUpQuestions.length > 0) {
        response = `Thank you for that information. To better understand your situation, ${analysis.followUpQuestions[0]}`
      } else {
        response = 'Thank you for sharing that information. Is there anything else you\'d like to tell me about your symptoms or how you\'ve been feeling?'
      }
      
      return { content: response }
    } catch (error) {
      console.error('AI response generation failed:', error)
      throw error
    }
  }

  private async generateSpeech(text: string): Promise<{ audioUrl: string }> {
    try {
      // In production, this would call the TTS service
      // For now, simulate speech generation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        audioUrl: `https://storage.googleapis.com/curax-audio/generated_${Date.now()}.mp3`
      }
    } catch (error) {
      console.error('Speech generation failed:', error)
      throw error
    }
  }

  private async generateEmergencyResponse(reason: string): Promise<{ content: string; audioUrl: string }> {
    const content = 'I detect that you may be experiencing a medical emergency. Please call emergency services immediately or go to the nearest emergency room. Do not wait. This could be life-threatening, and you need immediate medical attention.'
    
    const audioUrl = await this.generateSpeech(content)
    
    return { content, audioUrl: audioUrl.audioUrl }
  }

  private determineNextAction(session: VoiceSession, analysis: AnalysisResult): 'emergency' | 'follow_up' | 'continue' | 'complete' {
    if (session.emergencyDetected) return 'emergency'
    if (analysis.urgency === 'critical') return 'emergency'
    if (session.currentTurn >= this.flowConfig.maxTurns) return 'complete'
    if (analysis.confidence < this.flowConfig.confidenceThreshold) return 'follow_up'
    if (analysis.followUpQuestions.length === 0) return 'complete'
    return 'continue'
  }

  private async generateFinalAssessment(session: VoiceSession): Promise<void> {
    try {
      // In production, this would generate a comprehensive final assessment
      const assessment = {
        summary: 'Based on our conversation, here\'s my assessment of your situation.',
        possibleConditions: [
          { condition: 'Musculoskeletal pain', probability: 0.6, description: 'Pain in the chest area that worsens with breathing' },
          { condition: 'Respiratory infection', probability: 0.3, description: 'Possible infection affecting breathing' }
        ],
        urgency: session.context.assessment.urgency,
        recommendations: [
          'Consult with a healthcare provider within 24-48 hours',
          'Monitor symptoms and seek immediate care if they worsen',
          'Rest and avoid strenuous activity until evaluated'
        ],
        disclaimer: 'This is not a medical diagnosis. Please consult with qualified healthcare professionals.'
      }
      
      session.context.assessment = assessment
      
      // Add final assessment message
      const finalMessage: VoiceMessage = {
        id: 'msg_' + Date.now(),
        type: 'assistant',
        content: assessment.summary + ' ' + assessment.recommendations.join(' ') + ' ' + assessment.disclaimer,
        timestamp: new Date()
      }
      
      session.messages.push(finalMessage)
      
    } catch (error) {
      console.error('Final assessment generation failed:', error)
    }
  }

  getSession(sessionId: string): VoiceSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): VoiceSession[] {
    return Array.from(this.sessions.values())
  }

  endSession(sessionId: string): VoiceSession | undefined {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.status = 'completed'
      this.sessions.set(sessionId, session)
    }
    return session
  }
}

// Factory function to create voice diagnosis flow
export function createVoiceDiagnosisFlow(): VoiceDiagnosisFlow {
  return new VoiceDiagnosisFlow()
}