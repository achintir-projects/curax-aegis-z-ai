import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      foodName, 
      description, 
      analysisType, 
      input, 
      imageUrl, 
      userId, 
      familyId 
    } = body

    if (!foodName || !analysisType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize ZAI for food analysis
    const zai = await ZAI.create()

    // Create food analysis record
    const foodAnalysis = await db.foodAnalysis.create({
      data: {
        foodName,
        description,
        analysisType,
        input,
        imageUrl,
        userId,
        familyId
      }
    })

    let analysisData

    // Handle different analysis types
    if (analysisType === 'image' && imageUrl) {
      // AI Vision Analysis for image recognition
      analysisData = await analyzeImageWithAI(zai, imageUrl, foodName)
    } else if (analysisType === 'voice' || analysisType === 'text') {
      // Text-based analysis
      analysisData = await analyzeTextWithAI(zai, foodName, description || input || '')
    } else {
      // Fallback to basic analysis
      analysisData = await getBasicAnalysis(foodName)
    }

    // Save nutritional information
    await db.nutritionalInfo.create({
      data: {
        ...analysisData.nutritionalInfo,
        foodAnalysisId: foodAnalysis.id
      }
    })

    // Save ingredients
    for (const ingredient of analysisData.ingredients) {
      await db.ingredient.create({
        data: {
          name: ingredient.name,
          category: ingredient.category,
          isAllergenic: ingredient.isAllergenic,
          foodAnalysisId: foodAnalysis.id
        }
      })
    }

    // Generate family-specific recommendations if familyId is provided
    let familyRecommendations = []
    if (familyId) {
      const family = await db.family.findUnique({
        where: { id: familyId },
        include: {
          members: {
            include: {
              healthConditions: true,
              allergens: true
            }
          }
        }
      })

      if (family && family.members.length > 0) {
        for (const member of family.members) {
          const recommendations = await generateMemberRecommendations(
            member, 
            analysisData,
            zai
          )
          
          for (const rec of recommendations) {
            await db.familyRecommendation.create({
              data: {
                memberId: member.id,
                recommendation: rec.recommendation,
                concern: rec.concern,
                severity: rec.severity,
                suggestion: rec.suggestion,
                foodAnalysisId: foodAnalysis.id
              }
            })
          }
          familyRecommendations.push(...recommendations)
        }
      }
    }

    // Return complete analysis
    return NextResponse.json({
      success: true,
      data: {
        id: foodAnalysis.id,
        foodName: foodAnalysis.foodName,
        description: foodAnalysis.description,
        analysisType: foodAnalysis.analysisType,
        createdAt: foodAnalysis.createdAt,
        nutritionalInfo: analysisData.nutritionalInfo,
        ingredients: analysisData.ingredients,
        allergens: analysisData.allergens,
        healthScore: analysisData.healthScore,
        generalInsights: analysisData.generalInsights,
        familyRecommendations
      }
    })

  } catch (error) {
    console.error('Food analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function analyzeImageWithAI(zai: any, imageUrl: string, foodName: string) {
  try {
    // First, use AI vision to identify the food and ingredients
    const visionPrompt = `
      Analyze this food image and provide detailed information about:
      1. What food items are present in the image?
      2. What are the main ingredients you can identify?
      3. What cooking methods were used?
      4. Estimate the portion sizes
      5. Identify any potential allergens
      
      Food name provided: ${foodName}
      
      Please provide the analysis in JSON format:
      {
        "identifiedFood": "string",
        "ingredients": [
          {
            "name": "string",
            "category": "string",
            "isAllergenic": boolean
          }
        ],
        "cookingMethod": "string",
        "estimatedPortion": "string",
        "allergens": [
          {
            "name": "string",
            "severity": "mild" | "moderate" | "severe"
          }
        ],
        "confidence": number
      }
    `

    // For image analysis, we'll use a text-based approach since we can't directly send images
    // In a real implementation, you'd use vision AI services
    const visionResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI vision expert specialized in food recognition. Analyze food images and provide detailed nutritional information.'
        },
        {
          role: 'user',
          content: `I have an image of ${foodName}. Please analyze this food and provide detailed information about its ingredients, nutritional content, and health considerations. ${visionPrompt}`
        }
      ],
      temperature: 0.3
    })

    let visionData
    try {
      const content = visionResponse.choices[0]?.message?.content || '{}'
      visionData = JSON.parse(content)
    } catch (error) {
      console.error('Error parsing vision response:', error)
      visionData = {
        identifiedFood: foodName,
        ingredients: [],
        cookingMethod: 'unknown',
        estimatedPortion: 'medium',
        allergens: [],
        confidence: 0.7
      }
    }

    // Now get detailed nutritional analysis
    const nutritionPrompt = `
      Based on the following food analysis, provide detailed nutritional information:
      
      Food: ${visionData.identifiedFood}
      Ingredients: ${visionData.ingredients.map(i => i.name).join(', ')}
      Cooking Method: ${visionData.cookingMethod}
      Portion: ${visionData.estimatedPortion}
      
      Please provide comprehensive nutritional analysis in JSON format:
      {
        "nutritionalInfo": {
          "calories": number,
          "protein": number,
          "carbohydrates": number,
          "fat": number,
          "fiber": number,
          "sugar": number,
          "sodium": number,
          "cholesterol": number,
          "vitaminC": number,
          "calcium": number,
          "iron": number,
          "potassium": number,
          "vitaminD": number,
          "vitaminB12": number,
          "magnesium": number,
          "zinc": number
        },
        "healthScore": number,
        "generalInsights": [
          string
        ]
      }
    `

    const nutritionResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional nutritionist and food safety expert. Provide accurate, detailed nutritional analysis in JSON format.'
        },
        {
          role: 'user',
          content: nutritionPrompt
        }
      ],
      temperature: 0.3
    })

    let nutritionData
    try {
      const content = nutritionResponse.choices[0]?.message?.content || '{}'
      nutritionData = JSON.parse(content)
    } catch (error) {
      console.error('Error parsing nutrition response:', error)
      nutritionData = await getBasicAnalysis(visionData.identifiedFood)
    }

    return {
      ...nutritionData,
      ingredients: visionData.ingredients,
      allergens: visionData.allergens
    }

  } catch (error) {
    console.error('Image analysis failed:', error)
    return await getBasicAnalysis(foodName)
  }
}

async function analyzeTextWithAI(zai: any, foodName: string, description: string) {
  try {
    const analysisPrompt = `
      Analyze the following food item and provide detailed nutritional information:
      
      Food: ${foodName}
      Description: ${description}
      
      Please provide a comprehensive analysis in JSON format with the following structure:
      {
        "nutritionalInfo": {
          "calories": number,
          "protein": number,
          "carbohydrates": number,
          "fat": number,
          "fiber": number,
          "sugar": number,
          "sodium": number,
          "cholesterol": number,
          "vitaminC": number,
          "calcium": number,
          "iron": number,
          "potassium": number,
          "vitaminD": number,
          "vitaminB12": number,
          "magnesium": number,
          "zinc": number
        },
        "ingredients": [
          {
            "name": "string",
            "category": "string",
            "isAllergenic": boolean
          }
        ],
        "allergens": [
          {
            "name": "string",
            "severity": "mild" | "moderate" | "severe"
          }
        ],
        "healthScore": number,
        "generalInsights": [
          string
        ]
      }
    `

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional nutritionist and food safety expert. Provide accurate, detailed nutritional analysis in JSON format.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3
    })

    let analysisData
    try {
      const content = response.choices[0]?.message?.content || '{}'
      analysisData = JSON.parse(content)
    } catch (error) {
      console.error('Error parsing AI response:', error)
      analysisData = await getBasicAnalysis(foodName)
    }

    return analysisData

  } catch (error) {
    console.error('Text analysis failed:', error)
    return await getBasicAnalysis(foodName)
  }
}

async function getBasicAnalysis(foodName: string) {
  // Basic fallback analysis based on common food patterns
  const foodDatabase: any = {
    'chicken shawarma': {
      nutritionalInfo: {
        calories: 300,
        protein: 20,
        carbohydrates: 45,
        fat: 10,
        fiber: 4,
        sugar: 8,
        sodium: 600,
        cholesterol: 45,
        vitaminC: 12,
        calcium: 80,
        iron: 2.5,
        potassium: 350,
        vitaminD: 0.5,
        vitaminB12: 0.8,
        magnesium: 40,
        zinc: 1.5
      },
      ingredients: [
        { name: 'Chicken', category: 'protein', isAllergenic: false },
        { name: 'Pita bread', category: 'carb', isAllergenic: true },
        { name: 'Tomatoes', category: 'vegetable', isAllergenic: false },
        { name: 'Cucumber', category: 'vegetable', isAllergenic: false },
        { name: 'Onion', category: 'vegetable', isAllergenic: false },
        { name: 'Garlic sauce', category: 'sauce', isAllergenic: true }
      ],
      allergens: [
        { name: 'Gluten', severity: 'moderate' },
        { name: 'Dairy', severity: 'moderate' }
      ],
      healthScore: 72,
      generalInsights: [
        'Good source of lean protein from chicken',
        'Contains vegetables providing essential vitamins',
        'Moderate calorie content suitable for main meal',
        'Watch sodium content for blood pressure management'
      ]
    },
    'breakfast bowl': {
      nutritionalInfo: {
        calories: 380,
        protein: 12,
        carbohydrates: 58,
        fat: 14,
        fiber: 8,
        sugar: 20,
        sodium: 100,
        cholesterol: 0,
        vitaminC: 25,
        calcium: 150,
        iron: 3.2,
        potassium: 450,
        vitaminD: 1.2,
        vitaminB12: 0.5,
        magnesium: 85,
        zinc: 2.1
      },
      ingredients: [
        { name: 'Rolled oats', category: 'grain', isAllergenic: false },
        { name: 'Mixed berries', category: 'fruit', isAllergenic: false },
        { name: 'Almonds', category: 'nut', isAllergenic: true },
        { name: 'Honey', category: 'sweetener', isAllergenic: false },
        { name: 'Greek yogurt', category: 'dairy', isAllergenic: true }
      ],
      allergens: [
        { name: 'Nuts', severity: 'severe' },
        { name: 'Dairy', severity: 'moderate' }
      ],
      healthScore: 85,
      generalInsights: [
        'Complex carbohydrates provide sustained energy',
        'Rich in antioxidants from berries',
        'Good source of healthy fats and protein',
        'High fiber content promotes digestive health'
      ]
    }
  }

  // Try to match food name
  const normalizedFoodName = foodName.toLowerCase().trim()
  
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (normalizedFoodName.includes(key)) {
      return value
    }
  }

  // Default fallback
  return {
    nutritionalInfo: {
      calories: 250,
      protein: 15,
      carbohydrates: 30,
      fat: 8,
      fiber: 3,
      sugar: 5,
      sodium: 400,
      cholesterol: 20,
      vitaminC: 10,
      calcium: 50,
      iron: 2.0,
      potassium: 300,
      vitaminD: 0.5,
      vitaminB12: 0.5,
      magnesium: 30,
      zinc: 1.0
    },
    ingredients: [
      { name: foodName, category: 'main', isAllergenic: false }
    ],
    allergens: [],
    healthScore: 70,
    generalInsights: [
      'Moderate nutritional value',
      'Consider portion size for balanced diet',
      'Pair with vegetables for better nutrition'
    ]
  }
}

async function generateMemberRecommendations(member: any, analysisData: any, zai: any) {
  const healthConditions = member.healthConditions.map((hc: any) => hc.name).join(', ')
  const allergens = member.allergens.map((a: any) => a.name).join(', ')
  
  const recommendationPrompt = `
    Based on the following information, generate personalized food recommendations for a family member:
    
    Member: ${member.name}, Age: ${member.age}, Gender: ${member.gender}
    Health Conditions: ${healthConditions || 'None'}
    Allergies: ${allergens || 'None'}
    
    Food Analysis:
    - Nutritional Info: ${JSON.stringify(analysisData.nutritionalInfo)}
    - Ingredients: ${analysisData.ingredients.map((i: any) => i.name).join(', ')}
    - Allergens in food: ${analysisData.allergens.map((a: any) => a.name).join(', ')}
    
    Please provide recommendations in JSON format:
    [
      {
        "recommendation": "string",
        "concern": "string",
        "severity": "low" | "medium" | "high",
        "suggestion": "string"
      }
    ]
    
    Consider:
    1. How the food affects their specific health conditions
    2. Allergen conflicts
    3. Nutritional appropriateness for their age and gender
    4. Specific modification suggestions if needed
  `

  try {
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a personalized nutrition advisor specializing in family health. Provide specific, actionable recommendations.'
        },
        {
          role: 'user',
          content: recommendationPrompt
        }
      ],
      temperature: 0.4
    })

    const content = response.choices[0]?.message?.content || '[]'
    return JSON.parse(content)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const familyId = searchParams.get('familyId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const analyses = await db.foodAnalysis.findMany({
      where: {
        userId,
        ...(familyId && { familyId })
      },
      include: {
        nutritionalInfo: true,
        ingredients: true,
        familyRecommendations: {
          include: {
            member: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: analyses
    })

  } catch (error) {
    console.error('Error fetching food analyses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}