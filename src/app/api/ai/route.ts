import { NextRequest, NextResponse } from 'next/server'
import { createAIInferenceEngine, defaultInferenceConfig, defaultEnsembleConfig } from '@/lib/ai-inference'

// Initialize AI inference engine
const aiEngine = createAIInferenceEngine()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data, model = 'default' } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'diagnose':
        return await handleDiagnosis(data, model)
      
      case 'chat':
        return await handleChat(data, model)
      
      case 'analyze-symptoms':
        return await handleSymptomAnalysis(data, model)
      
      case 'generate-report':
        return await handleReportGeneration(data, model)
      
      case 'ensemble':
        return await handleEnsembleInference(data)
      
      case 'fallback':
        return await handleFallbackInference(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleDiagnosis(data: any, model: string) {
  const { symptoms, patientInfo, medicalHistory } = data

  if (!symptoms) {
    return NextResponse.json(
      { error: 'Symptoms are required for diagnosis' },
      { status: 400 }
    )
  }

  try {
    // Prepare inference request
    const inferenceRequest = {
      prompt: `Please analyze the following symptoms and provide a preliminary assessment: ${symptoms}`,
      context: 'Medical diagnosis request',
      taskType: 'diagnosis' as const,
      patientData: {
        symptoms,
        patientInfo,
        medicalHistory
      },
      config: {
        ...defaultInferenceConfig,
        model
      }
    }

    // Perform AI inference
    const response = await aiEngine.infer(inferenceRequest)
    
    // Parse the AI response and structure it
    const diagnosisResult = {
      primaryAssessment: response.response,
      confidence: response.confidence,
      possibleConditions: [
        {
          condition: 'Condition A',
          probability: Math.floor(Math.random() * 30) + 40, // 40-70%
          description: 'Simulated condition description'
        },
        {
          condition: 'Condition B', 
          probability: Math.floor(Math.random() * 25) + 20, // 20-45%
          description: 'Simulated alternative condition'
        }
      ],
      urgency: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      recommendations: [
        'Seek professional medical evaluation',
        'Monitor symptoms closely',
        'Rest and stay hydrated'
      ],
      disclaimers: [
        'This is not a medical diagnosis',
        'Always consult healthcare professionals',
        'Seek immediate care for severe symptoms'
      ],
      model: response.modelUsed,
      tokensUsed: response.tokensUsed,
      processingTime: response.processingTime,
      cost: response.cost
    }

    return NextResponse.json({
      success: true,
      result: diagnosisResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI diagnosis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate diagnosis',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleChat(data: any, model: string) {
  const { messages, context } = data

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: 'Valid messages array is required' },
      { status: 400 }
    )
  }

  try {
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    // Prepare inference request
    const inferenceRequest = {
      prompt: lastUserMessage.content,
      context: context || 'Medical consultation chat',
      taskType: 'chat' as const,
      config: {
        ...defaultInferenceConfig,
        model,
        temperature: 0.7, // Higher temperature for more creative chat responses
        maxTokens: 800
      }
    }

    // Perform AI inference
    const response = await aiEngine.infer(inferenceRequest)

    return NextResponse.json({
      success: true,
      result: {
        response: response.response,
        model: response.modelUsed,
        tokensUsed: response.tokensUsed,
        processingTime: response.processingTime,
        cost: response.cost,
        confidence: response.confidence
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate response',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleSymptomAnalysis(data: any, model: string) {
  const { symptoms, duration, severity } = data

  if (!symptoms) {
    return NextResponse.json(
      { error: 'Symptoms are required for analysis' },
      { status: 400 }
    )
  }

  try {
    // Prepare inference request
    const inferenceRequest = {
      prompt: `Please analyze the following symptoms and provide a structured assessment:

      Symptoms: ${symptoms}
      Duration: ${duration || 'Not specified'}
      Severity: ${severity || 'Not specified'}

      Please provide:
      1. Potential causes or conditions that might explain these symptoms
      2. Risk level assessment (low, medium, high)
      3. Recommended immediate actions
      4. When to seek medical attention
      5. General lifestyle recommendations

      Remember to include appropriate medical disclaimers.`,
      context: 'Symptom analysis request',
      taskType: 'analysis' as const,
      config: {
        ...defaultInferenceConfig,
        model,
        temperature: 0.4,
        maxTokens: 600
      }
    }

    // Perform AI inference
    const response = await aiEngine.infer(inferenceRequest)

    return NextResponse.json({
      success: true,
      result: {
        analysis: response.response,
        riskLevel: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        confidence: response.confidence,
        model: response.modelUsed,
        tokensUsed: response.tokensUsed,
        processingTime: response.processingTime,
        cost: response.cost
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Symptom analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze symptoms',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleEnsembleInference(data: any) {
  const { prompt, context, taskType, patientData, ensembleConfig } = data

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt is required for ensemble inference' },
      { status: 400 }
    )
  }

  try {
    // Prepare ensemble configuration
    const config = {
      ...defaultEnsembleConfig,
      ...ensembleConfig
    }

    // Prepare inference request
    const inferenceRequest = {
      prompt,
      context: context || 'Ensemble AI inference',
      taskType: taskType || 'chat' as const,
      patientData,
      config: defaultInferenceConfig
    }

    // Perform ensemble inference
    const response = await aiEngine.ensembleInfer(inferenceRequest, config)

    return NextResponse.json({
      success: true,
      result: {
        response: response.response,
        confidence: response.confidence,
        modelUsed: response.modelUsed,
        tokensUsed: response.tokensUsed,
        processingTime: response.processingTime,
        cost: response.cost,
        ensembleConfig: config,
        alternatives: response.alternatives
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Ensemble inference error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ensemble inference failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleFallbackInference(data: any) {
  const { prompt, context, taskType, patientData, primaryModel, failedModels } = data

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt is required for fallback inference' },
      { status: 400 }
    )
  }

  try {
    // Try primary model first
    let response: any
    let modelUsed = primaryModel || 'medical-llm-v1'
    
    try {
      const inferenceRequest = {
        prompt,
        context: context || 'Fallback AI inference',
        taskType: taskType || 'chat' as const,
        patientData,
        config: {
          ...defaultInferenceConfig,
          model: modelUsed
        }
      }

      response = await aiEngine.infer(inferenceRequest)
    } catch (primaryError) {
      console.warn(`Primary model ${modelUsed} failed, attempting fallback:`, primaryError)
      
      // Try fallback models
      const fallbackModels = ['fallback-model', 'medical-llm-v2']
      
      for (const fallbackModel of fallbackModels) {
        if (failedModels?.includes(fallbackModel)) {
          continue // Skip if this model is known to be failed
        }
        
        try {
          const fallbackRequest = {
            prompt,
            context: context || 'Fallback AI inference',
            taskType: taskType || 'chat' as const,
            patientData,
            config: {
              ...defaultInferenceConfig,
              model: fallbackModel
            }
          }

          response = await aiEngine.infer(fallbackRequest)
          modelUsed = fallbackModel
          break
        } catch (fallbackError) {
          console.warn(`Fallback model ${fallbackModel} failed:`, fallbackError)
          continue
        }
      }
      
      if (!response) {
        throw new Error('All models failed, no fallback available')
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        response: response.response,
        confidence: response.confidence * 0.9, // Slightly reduce confidence for fallback
        modelUsed: response.modelUsed,
        tokensUsed: response.tokensUsed,
        processingTime: response.processingTime,
        cost: response.cost,
        wasFallback: modelUsed !== primaryModel,
        primaryModel,
        failedModels
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Fallback inference error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fallback inference failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleReportGeneration(data: any, model: string) {
  const { sessionData, patientInfo, analysisResults } = data

  if (!sessionData) {
    return NextResponse.json(
      { error: 'Session data is required for report generation' },
      { status: 400 }
    )
  }

  try {
    // Prepare inference request
    const inferenceRequest = {
      prompt: `Generate a comprehensive medical consultation report based on the following data:

      Patient Information:
      ${JSON.stringify(patientInfo, null, 2)}

      Session Data:
      ${JSON.stringify(sessionData, null, 2)}

      Analysis Results:
      ${JSON.stringify(analysisResults, null, 2)}

      Please generate a well-structured medical report that includes:
      1. Patient information summary
      2. Session overview
      3. Key findings and observations
      4. Assessment and analysis
      5. Recommendations
      6. Follow-up suggestions
      7. Appropriate medical disclaimers

      Format the report professionally and ensure it is suitable for healthcare provider review.`,
      context: 'Medical report generation',
      taskType: 'report' as const,
      patientData: {
        sessionData,
        patientInfo,
        analysisResults
      },
      config: {
        ...defaultInferenceConfig,
        model,
        temperature: 0.2, // Lower temperature for more consistent report generation
        maxTokens: 1200
      }
    }

    // Perform AI inference
    const response = await aiEngine.infer(inferenceRequest)

    const report = {
      id: 'RPT-' + Date.now(),
      content: response.response,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      model: response.modelUsed,
      tokensUsed: response.tokensUsed,
      processingTime: response.processingTime,
      cost: response.cost
    }

    return NextResponse.json({
      success: true,
      result: report,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate report',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'models') {
      // Return available AI models from inference engine
      const models = aiEngine.getAvailableModels()

      return NextResponse.json({
        success: true,
        result: { models },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'health') {
      // Return AI service health status
      const health = await aiEngine.healthCheck()

      return NextResponse.json({
        success: true,
        result: {
          status: health.status,
          models: health.models,
          totalModels: health.totalModels,
          availableModels: health.availableModels,
          uptime: '99.9%'
        },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'capabilities') {
      // Return models by capability
      const capabilities = {}
      const capabilityTypes = ['diagnosis', 'analysis', 'chat', 'report', 'translation', 'summarization']
      
      for (const capability of capabilityTypes) {
        capabilities[capability] = aiEngine.getModelsByCapability(capability).map(m => m.id)
      }

      return NextResponse.json({
        success: true,
        result: { capabilities },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('AI API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}