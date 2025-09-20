import { NextRequest, NextResponse } from 'next/server'
import { createVisionAIService, defaultVisionConfig, defaultMedicalAnalysisConfig } from '@/lib/vision-ai'

// Initialize Vision AI service
const visionService = createVisionAIService(defaultVisionConfig)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, imageData, imageType, features, medicalConfig } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'analyze':
        return await handleImageAnalysis(imageData, features, medicalConfig)
      
      case 'analyze-medical':
        return await handleMedicalImageAnalysis(imageData, imageType, medicalConfig)
      
      case 'detect-text':
        return await handleTextDetection(imageData)
      
      case 'detect-labels':
        return await handleLabelDetection(imageData)
      
      case 'compare':
        return await handleImageComparison(imageData)
      
      case 'upload':
        return await handleImageUpload(imageData)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Imaging API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleImageAnalysis(imageData: any, features: any[], medicalConfig?: any) {
  try {
    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Prepare image configuration
    const imageConfig = {
      content: imageData.content || imageData,
      source: imageData.source
    }

    // Perform image analysis
    const response = await visionService.analyzeImage(imageConfig, features, medicalConfig)
    
    // Format the response
    const result = {
      analysisId: 'analysis_' + Date.now(),
      timestamp: new Date().toISOString(),
      imageType: 'general',
      features: features.map(f => f.type),
      results: response,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Image analysis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Image analysis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleMedicalImageAnalysis(imageData: any, imageType: string, medicalConfig?: any) {
  try {
    if (!imageData || !imageType) {
      return NextResponse.json(
        { error: 'Image data and image type are required' },
        { status: 400 }
      )
    }

    // Prepare image configuration
    const imageConfig = {
      content: imageData.content || imageData,
      source: imageData.source
    }

    // Merge with default medical config
    const config = {
      ...defaultMedicalAnalysisConfig,
      ...medicalConfig,
      medicalSpecialty: imageType === 'dermatology' ? 'dermatology' : 
                        imageType === 'retinal' ? 'ophthalmology' : 'radiology'
    }

    // Perform medical image analysis
    const response = await visionService.analyzeMedicalImage(imageConfig, imageType, config)
    
    // Format the response
    const result = {
      analysisId: 'medical_analysis_' + Date.now(),
      timestamp: new Date().toISOString(),
      imageType,
      medicalConfig: config,
      results: response,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Medical image analysis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Medical image analysis failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleTextDetection(imageData: any) {
  try {
    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Prepare image configuration
    const imageConfig = {
      content: imageData.content || imageData,
      source: imageData.source
    }

    // Perform text detection
    const response = await visionService.detectText(imageConfig, true)
    
    // Format the response
    const result = {
      analysisId: 'text_detection_' + Date.now(),
      timestamp: new Date().toISOString(),
      extractedText: response.textAnnotations?.map(t => t.text).join('\n') || '',
      annotations: response.textAnnotations,
      fullTextAnnotation: response.fullTextAnnotation,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Text detection failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Text detection failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleLabelDetection(imageData: any) {
  try {
    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Prepare image configuration
    const imageConfig = {
      content: imageData.content || imageData,
      source: imageData.source
    }

    // Perform label detection
    const response = await visionService.detectLabels(imageConfig, 10)
    
    // Format the response
    const result = {
      analysisId: 'label_detection_' + Date.now(),
      timestamp: new Date().toISOString(),
      labels: response.labelAnnotations,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Label detection failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Label detection failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleImageComparison(imageData: any) {
  try {
    const { image1, image2, comparisonType = 'temporal' } = imageData

    if (!image1 || !image2) {
      return NextResponse.json(
        { error: 'Both images are required for comparison' },
        { status: 400 }
      )
    }

    // Prepare image configurations
    const imageConfig1 = {
      content: image1.content || image1,
      source: image1.source
    }

    const imageConfig2 = {
      content: image2.content || image2,
      source: image2.source
    }

    // Perform image comparison
    const response = await visionService.compareImages(imageConfig1, imageConfig2, comparisonType)
    
    // Format the response
    const result = {
      comparisonId: 'comparison_' + Date.now(),
      timestamp: new Date().toISOString(),
      comparisonType,
      similarity: response.similarity,
      differences: response.differences,
      analysis: response.analysis,
      processingTime: Date.now()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Image comparison failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Image comparison failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleImageUpload(imageData: any) {
  try {
    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Simulate image upload and storage
    const imageId = 'img_' + Date.now()
    const imageUrl = `https://storage.googleapis.com/curax-medical-images/${imageId}.jpg`
    
    // Simulate upload processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Perform basic analysis on uploaded image
    const imageConfig = {
      content: imageData.content || imageData
    }

    const features = [
      { type: 'LABEL_DETECTION', maxResults: 5 },
      { type: 'TEXT_DETECTION', maxResults: 3 }
    ]

    const analysis = await visionService.analyzeImage(imageConfig, features)
    
    // Format the response
    const result = {
      imageId,
      imageUrl,
      originalName: imageData.name || 'uploaded_image.jpg',
      size: imageData.size || 0,
      format: imageData.format || 'JPEG',
      uploadedAt: new Date().toISOString(),
      analysis: {
        labels: analysis.labelAnnotations,
        text: analysis.textAnnotations,
        processingTime: Date.now()
      }
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Image upload failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Image upload failed',
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

    if (action === 'features') {
      // Return supported features
      const features = visionService.getSupportedFeatures()

      return NextResponse.json({
        success: true,
        result: { features },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'image-types') {
      // Return supported image types
      const imageTypes = visionService.getSupportedImageTypes()

      return NextResponse.json({
        success: true,
        result: { imageTypes },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'status') {
      // Return Vision AI service status
      return NextResponse.json({
        success: true,
        result: {
          status: 'operational',
          service: 'Google Cloud Vision AI',
          features: visionService.getSupportedFeatures().length,
          imageTypes: visionService.getSupportedImageTypes().length,
          averageResponseTime: 2000,
          uptime: '99.9%'
        },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Imaging API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}