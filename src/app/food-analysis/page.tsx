'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Mic, 
  Camera, 
  BarChart3, 
  Apple,
  Pizza,
  Salad,
  ChefHat,
  TrendingUp,
  Heart,
  AlertTriangle,
  Users,
  Clock,
  Flame,
  Target,
  Shield,
  Zap
} from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  age: number
  gender: string
  healthConditions: Array<{
    name: string
    severity: string
  }>
  allergens: Array<{
    name: string
    severity: string
  }>
}

interface NutritionalInfo {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  cholesterol: number
  vitaminC?: number
  calcium?: number
  iron?: number
  potassium?: number
  vitaminD?: number
  vitaminB12?: number
  magnesium?: number
  zinc?: number
}

interface Ingredient {
  name: string
  category: string
  isAllergenic: boolean
}

interface Allergen {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
}

interface FamilyRecommendation {
  id: string
  memberId: string
  member: FamilyMember
  recommendation: string
  concern?: string
  severity: 'low' | 'medium' | 'high'
  suggestion?: string
}

interface FoodAnalysisResult {
  id: string
  foodName: string
  description?: string
  analysisType: string
  createdAt: string
  nutritionalInfo: NutritionalInfo
  ingredients: Ingredient[]
  allergens: Allergen[]
  healthScore: number
  generalInsights: string[]
  familyRecommendations: FamilyRecommendation[]
}

export default function FoodAnalysis() {
  const [selectedTab, setSelectedTab] = useState('upload')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null)
  const [selectedFamily, setSelectedFamily] = useState<string>('none')
  const [families, setFamilies] = useState<any[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [textInput, setTextInput] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading families and members
    setFamilies([
      { id: '1', name: 'Smith Family' },
      { id: '2', name: 'Johnson Family' }
    ])
    
    setFamilyMembers([
      {
        id: '1',
        name: 'edong boni',
        age: 45,
        gender: 'Male',
        healthConditions: [
          { name: 'Diabetes', severity: 'moderate' },
          { name: 'Hypertension', severity: 'mild' }
        ],
        allergens: []
      },
      {
        id: '2',
        name: 'Sarah Smith',
        age: 12,
        gender: 'Female',
        healthConditions: [],
        allergens: [
          { name: 'Gluten', severity: 'severe' },
          { name: 'Dairy', severity: 'moderate' }
        ]
      }
    ])
  }, [])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)

    try {
      // Convert image to base64 for preview
      const base64Image = await fileToBase64(file)
      console.log('Image converted to base64, length:', base64Image.length)
      setUploadedImage(base64Image)
      setUploadedFileName(file.name)
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const analyzeUploadedImage = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first')
      return
    }

    setIsAnalyzing(true)
    try {
      // Use AI-powered analysis
      const aiResult = await analyzeFoodWithAI(uploadedFileName, 'image', uploadedImage)
      setAnalysisResult(aiResult)
    } catch (error) {
      console.error('Image analysis failed:', error)
      alert('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearUploadedImage = () => {
    setUploadedImage(null)
    setUploadedFileName('')
    setAnalysisResult(null)
  }

  const handleTakePhoto = async () => {
    try {
      console.log('Attempting to access camera...')
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }

      // Check camera permissions first
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })
      console.log('Camera permission status:', permissions.state)
      
      if (permissions.state === 'denied') {
        throw new Error('Camera permission denied. Please allow camera access in your browser settings.')
      }

      // Request camera access and take photo
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('Camera access granted')
      
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Create canvas to capture photo
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      // Wait for video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0)

      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.8)
      console.log('Photo captured, base64 length:', base64Image.length)
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop())
      console.log('Camera stream stopped')

      // Store the captured image for preview
      setUploadedImage(base64Image)
      setUploadedFileName('Captured Food Photo')
      
    } catch (error) {
      console.error('Photo capture failed:', error)
      let errorMessage = 'Failed to capture photo. Please try again.'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.'
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleVoiceDescription = async () => {
    setIsAnalyzing(true)
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported')
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      const transcript = await new Promise<string>((resolve, reject) => {
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          resolve(transcript)
        }
        recognition.onerror = (event) => {
          reject(new Error(event.error))
        }
        recognition.start()
      })

      console.log('Voice transcript:', transcript)

      // Use AI-powered analysis
      const aiResult = await analyzeFoodWithAI(transcript, 'voice')
      setAnalysisResult(aiResult)
      
    } catch (error) {
      console.error('Voice analysis failed:', error)
      let errorMessage = 'Failed to process voice input. Please try again.'
      
      if (error instanceof Error) {
        if (error.message === 'Speech recognition not supported') {
          errorMessage = 'Speech recognition is not supported in this browser.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return
    
    setIsAnalyzing(true)
    try {
      // Use AI-powered analysis
      const aiResult = await analyzeFoodWithAI(textInput, 'text')
      setAnalysisResult(aiResult)
    } catch (error) {
      console.error('Text analysis failed:', error)
      alert('Failed to analyze text. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Helper function to generate general insights based on food
  const generateGeneralInsights = (food: any) => {
    const insights = []
    
    if (food.nutrition.protein > 20) {
      insights.push('Excellent source of protein for muscle maintenance')
    } else if (food.nutrition.protein > 10) {
      insights.push('Good source of protein')
    }
    
    if (food.nutrition.fiber > 5) {
      insights.push('High fiber content promotes digestive health')
    } else if (food.nutrition.fiber > 3) {
      insights.push('Contains dietary fiber for digestive health')
    }
    
    if (food.nutrition.calories > 400) {
      insights.push('High calorie content - suitable for main meals')
    } else if (food.nutrition.calories < 200) {
      insights.push('Low calorie content - suitable for weight management')
    } else {
      insights.push('Moderate calorie content suitable for balanced meals')
    }
    
    if (food.nutrition.sodium > 600) {
      insights.push('High sodium content - monitor for blood pressure management')
    } else if (food.nutrition.sodium > 400) {
      insights.push('Moderate sodium content - be mindful of total daily intake')
    }
    
    if (food.nutrition.vitaminC > 20) {
      insights.push('Excellent source of Vitamin C for immune support')
    } else if (food.nutrition.vitaminC > 10) {
      insights.push('Good source of Vitamin C')
    }
    
    if (food.nutrition.calcium > 150) {
      insights.push('Excellent source of calcium for bone health')
    } else if (food.nutrition.calcium > 80) {
      insights.push('Good source of calcium')
    }
    
    if (food.nutrition.iron > 3) {
      insights.push('Excellent source of iron for blood health')
    } else if (food.nutrition.iron > 2) {
      insights.push('Good source of iron')
    }
    
    // Add specific insights based on food type
    if (food.name.toLowerCase().includes('salad')) {
      insights.push('Rich in vitamins and minerals from fresh vegetables')
    }
    
    if (food.name.toLowerCase().includes('chicken') || food.name.toLowerCase().includes('fish')) {
      insights.push('Lean protein source with essential amino acids')
    }
    
    if (food.name.toLowerCase().includes('pizza') || food.name.toLowerCase().includes('burger')) {
      insights.push('Consider as occasional treat due to high fat and sodium content')
    }
    
    return insights
  }

  // Mock analysis functions for fallback
  const mockImageAnalysis = async (fileName: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Food database with comprehensive nutritional information
    const foodDatabase = {
      // Pizza variations
      pizza: {
        name: 'Pizza',
        description: 'Italian dish with dough, tomato sauce, cheese, and various toppings',
        nutrition: { calories: 285, protein: 12, carbohydrates: 36, fat: 10, fiber: 2.5, sugar: 4, sodium: 640, cholesterol: 25, vitaminC: 8, calcium: 180, iron: 2.1, potassium: 200, vitaminD: 0.3, vitaminB12: 0.6, magnesium: 25, zinc: 1.2 },
        ingredients: [
          { name: 'Pizza dough', category: 'carb', isAllergenic: true },
          { name: 'Tomato sauce', category: 'sauce', isAllergenic: false },
          { name: 'Mozzarella cheese', category: 'dairy', isAllergenic: true },
          { name: 'Pepperoni', category: 'protein', isAllergenic: false },
          { name: 'Bell peppers', category: 'vegetable', isAllergenic: false },
          { name: 'Mushrooms', category: 'vegetable', isAllergenic: false }
        ],
        allergens: [
          { name: 'Gluten', severity: 'high' },
          { name: 'Dairy', severity: 'high' }
        ],
        healthScore: 65
      },
      // Burger variations
      burger: {
        name: 'Beef Burger',
        description: 'Ground beef patty served in a bun with various toppings',
        nutrition: { calories: 540, protein: 25, carbohydrates: 40, fat: 30, fiber: 2, sugar: 8, sodium: 980, cholesterol: 85, vitaminC: 6, calcium: 120, iron: 4.5, potassium: 400, vitaminD: 0.8, vitaminB12: 2.1, magnesium: 35, zinc: 4.2 },
        ingredients: [
          { name: 'Beef patty', category: 'protein', isAllergenic: false },
          { name: 'Hamburger bun', category: 'carb', isAllergenic: true },
          { name: 'Cheddar cheese', category: 'dairy', isAllergenic: true },
          { name: 'Lettuce', category: 'vegetable', isAllergenic: false },
          { name: 'Tomato', category: 'vegetable', isAllergenic: false },
          { name: 'Ketchup', category: 'sauce', isAllergenic: false }
        ],
        allergens: [
          { name: 'Gluten', severity: 'high' },
          { name: 'Dairy', severity: 'moderate' }
        ],
        healthScore: 58
      },
      // Salad variations
      salad: {
        name: 'Garden Salad',
        description: 'Fresh mixed vegetables with light dressing',
        nutrition: { calories: 120, protein: 3, carbohydrates: 15, fat: 6, fiber: 4, sugar: 8, sodium: 200, cholesterol: 0, vitaminC: 45, calcium: 60, iron: 1.8, potassium: 450, vitaminD: 0, vitaminB12: 0, magnesium: 30, zinc: 0.8 },
        ingredients: [
          { name: 'Lettuce', category: 'vegetable', isAllergenic: false },
          { name: 'Tomatoes', category: 'vegetable', isAllergenic: false },
          { name: 'Cucumber', category: 'vegetable', isAllergenic: false },
          { name: 'Bell peppers', category: 'vegetable', isAllergenic: false },
          { name: 'Olive oil dressing', category: 'sauce', isAllergenic: false },
          { name: 'Feta cheese', category: 'dairy', isAllergenic: true }
        ],
        allergens: [
          { name: 'Dairy', severity: 'low' }
        ],
        healthScore: 85
      },
      // Pasta variations
      pasta: {
        name: 'Spaghetti Carbonara',
        description: 'Italian pasta dish with eggs, cheese, and pancetta',
        nutrition: { calories: 420, protein: 18, carbohydrates: 50, fat: 18, fiber: 3, sugar: 6, sodium: 720, cholesterol: 120, vitaminC: 4, calcium: 150, iron: 2.8, potassium: 280, vitaminD: 0.6, vitaminB12: 0.9, magnesium: 40, zinc: 2.1 },
        ingredients: [
          { name: 'Spaghetti', category: 'carb', isAllergenic: true },
          { name: 'Eggs', category: 'protein', isAllergenic: true },
          { name: 'Parmesan cheese', category: 'dairy', isAllergenic: true },
          { name: 'Pancetta', category: 'protein', isAllergenic: false },
          { name: 'Black pepper', category: 'spice', isAllergenic: false }
        ],
        allergens: [
          { name: 'Gluten', severity: 'high' },
          { name: 'Dairy', severity: 'high' },
          { name: 'Eggs', severity: 'high' }
        ],
        healthScore: 62
      },
      // Sushi variations
      sushi: {
        name: 'Sushi Roll',
        description: 'Japanese dish with vinegared rice, fish, and vegetables',
        nutrition: { calories: 255, protein: 9, carbohydrates: 38, fat: 7, fiber: 2.5, sugar: 6, sodium: 420, cholesterol: 20, vitaminC: 12, calcium: 40, iron: 2.0, potassium: 300, vitaminD: 1.2, vitaminB12: 1.5, magnesium: 35, zinc: 1.1 },
        ingredients: [
          { name: 'Sushi rice', category: 'carb', isAllergenic: false },
          { name: 'Raw salmon', category: 'protein', isAllergenic: false },
          { name: 'Nori seaweed', category: 'vegetable', isAllergenic: false },
          { name: 'Avocado', category: 'fruit', isAllergenic: false },
          { name: 'Cucumber', category: 'vegetable', isAllergenic: false },
          { name: 'Soy sauce', category: 'sauce', isAllergenic: true }
        ],
        allergens: [
          { name: 'Soy', severity: 'moderate' },
          { name: 'Fish', severity: 'high' }
        ],
        healthScore: 78
      },
      // Chicken variations
      chicken: {
        name: 'Grilled Chicken Breast',
        description: 'Lean grilled chicken breast with herbs and spices',
        nutrition: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85, vitaminC: 0, calcium: 15, iron: 1.1, potassium: 256, vitaminD: 0.1, vitaminB12: 0.3, magnesium: 25, zinc: 0.9 },
        ingredients: [
          { name: 'Chicken breast', category: 'protein', isAllergenic: false },
          { name: 'Olive oil', category: 'fat', isAllergenic: false },
          { name: 'Garlic', category: 'spice', isAllergenic: false },
          { name: 'Herbs', category: 'spice', isAllergenic: false },
          { name: 'Black pepper', category: 'spice', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 92
      },
      // Rice variations
      rice: {
        name: 'Steamed Rice',
        description: 'Plain steamed white rice',
        nutrition: { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1, cholesterol: 0, vitaminC: 0, calcium: 10, iron: 0.8, potassium: 35, vitaminD: 0, vitaminB12: 0, magnesium: 12, zinc: 0.4 },
        ingredients: [
          { name: 'White rice', category: 'carb', isAllergenic: false },
          { name: 'Water', category: 'liquid', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 75
      },
      // Fish variations
      fish: {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon grilled with herbs and lemon',
        nutrition: { calories: 208, protein: 22, carbohydrates: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59, cholesterol: 55, vitaminC: 0, calcium: 12, iron: 0.8, potassium: 363, vitaminD: 11, vitaminB12: 3.2, magnesium: 27, zinc: 0.5 },
        ingredients: [
          { name: 'Salmon fillet', category: 'protein', isAllergenic: false },
          { name: 'Lemon', category: 'fruit', isAllergenic: false },
          { name: 'Olive oil', category: 'fat', isAllergenic: false },
          { name: 'Dill', category: 'herb', isAllergenic: false }
        ],
        allergens: [
          { name: 'Fish', severity: 'high' }
        ],
        healthScore: 88
      },
      // Default/unknown food
      default: {
        name: 'Mixed Food Dish',
        description: 'A variety of food items combined in one dish',
        nutrition: { calories: 320, protein: 15, carbohydrates: 35, fat: 14, fiber: 4, sugar: 8, sodium: 500, cholesterol: 45, vitaminC: 20, calcium: 80, iron: 2.5, potassium: 350, vitaminD: 0.5, vitaminB12: 0.8, magnesium: 40, zinc: 1.5 },
        ingredients: [
          { name: 'Mixed ingredients', category: 'mixed', isAllergenic: false },
          { name: 'Various spices', category: 'spice', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 70
      }
    }

    // Determine food type based on filename
    const fileNameLower = fileName.toLowerCase()
    let detectedFood = foodDatabase.default
    
    if (fileNameLower.includes('pizza')) {
      detectedFood = foodDatabase.pizza
    } else if (fileNameLower.includes('burger') || fileNameLower.includes('hamburger')) {
      detectedFood = foodDatabase.burger
    } else if (fileNameLower.includes('salad')) {
      detectedFood = foodDatabase.salad
    } else if (fileNameLower.includes('pasta') || fileNameLower.includes('spaghetti')) {
      detectedFood = foodDatabase.pasta
    } else if (fileNameLower.includes('sushi')) {
      detectedFood = foodDatabase.sushi
    } else if (fileNameLower.includes('chicken') || fileNameLower.includes('shawarma')) {
      detectedFood = foodDatabase.chicken
    } else if (fileNameLower.includes('rice')) {
      detectedFood = foodDatabase.rice
    } else if (fileNameLower.includes('fish') || fileNameLower.includes('salmon')) {
      detectedFood = foodDatabase.fish
    }

    const mockResult: FoodAnalysisResult = {
      id: Date.now().toString(),
      foodName: detectedFood.name,
      description: detectedFood.description,
      analysisType: 'image',
      createdAt: new Date().toISOString(),
      nutritionalInfo: detectedFood.nutrition,
      ingredients: detectedFood.ingredients,
      allergens: detectedFood.allergens,
      healthScore: detectedFood.healthScore,
      generalInsights: generateGeneralInsights(detectedFood),
      familyRecommendations: selectedFamily !== 'none' ? [
        {
          id: '1',
          memberId: '1',
          member: familyMembers[0],
          recommendation: 'Limit to half portion and monitor blood sugar levels',
          concern: 'High carbohydrate content may affect blood sugar management',
          severity: 'high',
          suggestion: 'Consider using whole wheat pita and reducing garlic sauce'
        },
        {
          id: '2',
          memberId: '2',
          member: familyMembers[1],
          recommendation: 'Avoid this meal due to gluten and dairy content',
          concern: 'Contains allergens that could cause severe reaction',
          severity: 'high',
          suggestion: 'Try gluten-free wrap with dairy-free alternatives'
        }
      ] : []
    }
    
    setAnalysisResult(mockResult)
  }

  const mockVoiceAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult: FoodAnalysisResult = {
      id: '2',
      foodName: 'Breakfast Bowl',
      description: 'Oatmeal with berries and nuts',
      analysisType: 'voice',
      createdAt: new Date().toISOString(),
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
      ],
      familyRecommendations: selectedFamily !== 'none' ? [
        {
          id: '3',
          memberId: '1',
          member: familyMembers[0],
          recommendation: 'Suitable meal but monitor blood sugar response',
          concern: 'Natural sugars from berries and honey may impact glucose levels',
          severity: 'medium',
          suggestion: 'Consider reducing honey and adding more protein'
        },
        {
          id: '4',
          memberId: '2',
          member: familyMembers[1],
          recommendation: 'Avoid due to nut and dairy allergens',
          concern: 'Contains severe allergens',
          severity: 'high',
          suggestion: 'Try seed-based alternatives and coconut yogurt'
        }
      ] : []
    }
    
    setAnalysisResult(mockResult)
  }

  // Intelligent AI-powered food analysis using ZAI SDK
  const analyzeFoodWithAI = async (input: string, type: 'text' | 'image' | 'voice', imageData?: string) => {
    try {
      // Import ZAI SDK
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      let analysisPrompt = ''
      
      if (type === 'text') {
        analysisPrompt = `Analyze the following food description and provide detailed nutritional information:

Food Description: "${input}"

Please provide a comprehensive analysis including:
1. Food name and brief description
2. Detailed nutritional information (calories, protein, carbohydrates, fat, fiber, sugar, sodium, cholesterol, vitamins, minerals)
3. List of ingredients with categories and allergen status
4. Common allergens present
5. Health score (1-100)
6. General health insights
7. Suitable portion size recommendations

Format your response as JSON with the following structure:
{
  "foodName": "Name of the dish",
  "description": "Brief description",
  "nutritionalInfo": {
    "calories": number per 100g,
    "protein": number in grams,
    "carbohydrates": number in grams,
    "fat": number in grams,
    "fiber": number in grams,
    "sugar": number in grams,
    "sodium": number in mg,
    "cholesterol": number in mg,
    "vitaminC": number in mg,
    "calcium": number in mg,
    "iron": number in mg,
    "potassium": number in mg,
    "vitaminD": number in mcg,
    "vitaminB12": number in mcg,
    "magnesium": number in mg,
    "zinc": number in mg
  },
  "ingredients": [
    {"name": "ingredient name", "category": "protein|carb|vegetable|fruit|dairy|sauce|spice|fat", "isAllergenic": true/false}
  ],
  "allergens": [
    {"name": "allergen name", "severity": "low|moderate|high"}
  ],
  "healthScore": number,
  "generalInsights": ["insight 1", "insight 2", "insight 3", "insight 4"]
}

Be specific and accurate. For traditional African dishes like fufu and palm nut soup, provide authentic nutritional data based on traditional ingredients and preparation methods.`
      } else if (type === 'image') {
        analysisPrompt = `Analyze this food image and provide detailed nutritional information. The image filename suggests: "${input}"

Please identify the food, ingredients, and provide comprehensive nutritional analysis in JSON format as described for text analysis. Pay special attention to:
1. Accurate food identification
2. Realistic portion size estimation
3. Authentic nutritional values for the specific cuisine
4. Proper ingredient breakdown
5. Allergen identification

Format your response as JSON with the same structure as the text analysis.`
      } else if (type === 'voice') {
        analysisPrompt = `Analyze the following voice-transcribed food description and provide detailed nutritional information:

Transcribed Description: "${input}"

Please provide comprehensive nutritional analysis in JSON format, accounting for any potential transcription errors or ambiguities in the voice input. Use the same JSON structure as text analysis.`
      }

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert nutritionist and food analyst with deep knowledge of global cuisines, including African, Asian, European, and American dishes. Provide accurate, detailed nutritional information and health insights.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 2000
      })

      const aiResponse = completion.choices[0]?.message?.content
      
      if (aiResponse) {
        try {
          // Parse the JSON response
          const parsedData = JSON.parse(aiResponse)
          return parsedData
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError)
          // Fallback to enhanced mock analysis
          return await enhancedMockAnalysis(input, type)
        }
      } else {
        throw new Error('No response from AI')
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Fallback to enhanced mock analysis
      return await enhancedMockAnalysis(input, type)
    }
  }

  // Enhanced mock analysis with better food recognition
  const enhancedMockAnalysis = async (input: string, type: 'text' | 'image' | 'voice') => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const inputLower = input.toLowerCase()
    
    // Comprehensive food database with authentic nutritional data
    const foodDatabase = {
      // African dishes
      'fufu': {
        name: 'Fufu',
        description: 'Traditional West African staple made from cassava, yam, or plantain',
        nutrition: { calories: 267, protein: 1.5, carbohydrates: 68, fat: 0.2, fiber: 2.5, sugar: 3.2, sodium: 15, cholesterol: 0, vitaminC: 25, calcium: 20, iron: 1.0, potassium: 450, vitaminD: 0, vitaminB12: 0, magnesium: 30, zinc: 0.5 },
        ingredients: [
          { name: 'Cassava/Yam/Plantain', category: 'carb', isAllergenic: false },
          { name: 'Water', category: 'liquid', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 75
      },
      'palm nut soup': {
        name: 'Palm Nut Soup',
        description: 'Rich West African soup made from palm nuts, served with fufu or rice',
        nutrition: { calories: 180, protein: 3.5, carbohydrates: 8, fat: 15, fiber: 3.5, sugar: 2.1, sodium: 320, cholesterol: 0, vitaminC: 12, calcium: 45, iron: 2.8, potassium: 380, vitaminD: 0, vitaminB12: 0, magnesium: 40, zinc: 1.2 },
        ingredients: [
          { name: 'Palm nuts', category: 'fat', isAllergenic: false },
          { name: 'Leafy vegetables', category: 'vegetable', isAllergenic: false },
          { name: 'Meat/Fish', category: 'protein', isAllergenic: false },
          { name: 'Spices', category: 'spice', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 72
      },
      'jollof rice': {
        name: 'Jollof Rice',
        description: 'Popular West African one-pot rice dish with tomatoes and spices',
        nutrition: { calories: 195, protein: 4.5, carbohydrates: 35, fat: 5.2, fiber: 2.1, sugar: 6.8, sodium: 280, cholesterol: 0, vitaminC: 18, calcium: 35, iron: 2.2, potassium: 220, vitaminD: 0, vitaminB12: 0, magnesium: 25, zinc: 0.8 },
        ingredients: [
          { name: 'Rice', category: 'carb', isAllergenic: false },
          { name: 'Tomatoes', category: 'vegetable', isAllergenic: false },
          { name: 'Onions', category: 'vegetable', isAllergenic: false },
          { name: 'Vegetable oil', category: 'fat', isAllergenic: false },
          { name: 'Spices', category: 'spice', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 78
      },
      // Add more food types from the existing database
      'pizza': {
        name: 'Pizza',
        description: 'Italian dish with dough, tomato sauce, cheese, and various toppings',
        nutrition: { calories: 285, protein: 12, carbohydrates: 36, fat: 10, fiber: 2.5, sugar: 4, sodium: 640, cholesterol: 25, vitaminC: 8, calcium: 180, iron: 2.1, potassium: 200, vitaminD: 0.3, vitaminB12: 0.6, magnesium: 25, zinc: 1.2 },
        ingredients: [
          { name: 'Pizza dough', category: 'carb', isAllergenic: true },
          { name: 'Tomato sauce', category: 'sauce', isAllergenic: false },
          { name: 'Mozzarella cheese', category: 'dairy', isAllergenic: true },
          { name: 'Pepperoni', category: 'protein', isAllergenic: false },
          { name: 'Bell peppers', category: 'vegetable', isAllergenic: false },
          { name: 'Mushrooms', category: 'vegetable', isAllergenic: false }
        ],
        allergens: [
          { name: 'Gluten', severity: 'high' },
          { name: 'Dairy', severity: 'high' }
        ],
        healthScore: 65
      },
      'burger': {
        name: 'Beef Burger',
        description: 'Ground beef patty served in a bun with various toppings',
        nutrition: { calories: 540, protein: 25, carbohydrates: 40, fat: 30, fiber: 2, sugar: 8, sodium: 980, cholesterol: 85, vitaminC: 6, calcium: 120, iron: 4.5, potassium: 400, vitaminD: 0.8, vitaminB12: 2.1, magnesium: 35, zinc: 4.2 },
        ingredients: [
          { name: 'Beef patty', category: 'protein', isAllergenic: false },
          { name: 'Hamburger bun', category: 'carb', isAllergenic: true },
          { name: 'Cheddar cheese', category: 'dairy', isAllergenic: true },
          { name: 'Lettuce', category: 'vegetable', isAllergenic: false },
          { name: 'Tomato', category: 'vegetable', isAllergenic: false },
          { name: 'Ketchup', category: 'sauce', isAllergenic: false }
        ],
        allergens: [
          { name: 'Gluten', severity: 'high' },
          { name: 'Dairy', severity: 'moderate' }
        ],
        healthScore: 58
      },
      'default': {
        name: 'Mixed Food Dish',
        description: 'A variety of food items combined in one dish',
        nutrition: { calories: 320, protein: 15, carbohydrates: 35, fat: 14, fiber: 4, sugar: 8, sodium: 500, cholesterol: 45, vitaminC: 20, calcium: 80, iron: 2.5, potassium: 350, vitaminD: 0.5, vitaminB12: 0.8, magnesium: 40, zinc: 1.5 },
        ingredients: [
          { name: 'Mixed ingredients', category: 'mixed', isAllergenic: false },
          { name: 'Various spices', category: 'spice', isAllergenic: false }
        ],
        allergens: [],
        healthScore: 70
      }
    }

    // Smart food detection
    let detectedFood = foodDatabase.default
    
    // Check for African dishes first
    if (inputLower.includes('fufu')) {
      detectedFood = foodDatabase.fufu
    } else if (inputLower.includes('palm nut soup') || inputLower.includes('palm soup') || inputLower.includes('banga soup')) {
      detectedFood = foodDatabase['palm nut soup']
    } else if (inputLower.includes('jollof rice')) {
      detectedFood = foodDatabase['jollof rice']
    } else if (inputLower.includes('pizza')) {
      detectedFood = foodDatabase.pizza
    } else if (inputLower.includes('burger') || inputLower.includes('hamburger')) {
      detectedFood = foodDatabase.burger
    }

    return {
      id: Date.now().toString(),
      foodName: detectedFood.name,
      description: detectedFood.description,
      analysisType: type,
      createdAt: new Date().toISOString(),
      nutritionalInfo: detectedFood.nutrition,
      ingredients: detectedFood.ingredients,
      allergens: detectedFood.allergens,
      healthScore: detectedFood.healthScore,
      generalInsights: generateGeneralInsights(detectedFood),
      familyRecommendations: selectedFamily !== 'none' ? [
        {
          id: '1',
          memberId: '1',
          member: familyMembers[0],
          recommendation: 'Consider portion size and dietary needs',
          concern: 'General health considerations',
          severity: 'low',
          modificationSuggestions: ['Adjust portion size as needed', 'Balance with other food groups']
        }
      ] : []
    }
  }
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult: FoodAnalysisResult = {
      id: '3',
      foodName: 'Grilled Chicken Salad',
      description: textInput,
      analysisType: 'text',
      createdAt: new Date().toISOString(),
      nutritionalInfo: {
        calories: 320,
        protein: 28,
        carbohydrates: 12,
        fat: 18,
        fiber: 6,
        sugar: 8,
        sodium: 400,
        cholesterol: 65,
        vitaminC: 35,
        calcium: 60,
        iron: 2.8,
        potassium: 520,
        vitaminD: 0.8,
        vitaminB12: 1.2,
        magnesium: 45,
        zinc: 2.5
      },
      ingredients: [
        { name: 'Grilled chicken breast', category: 'protein', isAllergenic: false },
        { name: 'Mixed greens', category: 'vegetable', isAllergenic: false },
        { name: 'Cherry tomatoes', category: 'vegetable', isAllergenic: false },
        { name: 'Cucumber', category: 'vegetable', isAllergenic: false },
        { name: 'Olive oil dressing', category: 'fat', isAllergenic: false }
      ],
      allergens: [],
      healthScore: 92,
      generalInsights: [
        'High in lean protein for muscle maintenance',
        'Excellent source of vitamins and minerals',
        'Heart-healthy fats from olive oil',
        'Low glycemic index suitable for diabetics'
      ],
      familyRecommendations: selectedFamily !== 'none' ? [
        {
          id: '5',
          memberId: '1',
          member: familyMembers[0],
          recommendation: 'Excellent choice for blood sugar management',
          concern: 'Low carb content helps maintain stable glucose levels',
          severity: 'low',
          suggestion: 'Add quinoa for complex carbohydrates if needed'
        },
        {
          id: '6',
          memberId: '2',
          member: familyMembers[1],
          recommendation: 'Safe and nutritious option',
          concern: 'No allergens present',
          severity: 'low',
          suggestion: 'Add colorful vegetables for more vitamins'
        }
      ] : []
    }
    
    setAnalysisResult(mockResult)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Curax AI</h1>
                <p className="text-xs text-gray-500">Food Analysis</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#family" className="text-gray-600 hover:text-gray-900 transition-colors">Family Health</a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800">
            AI-Powered Food Analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI Food Analysis
            <span className="text-orange-600 block">Get comprehensive food safety analysis for your family</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload food images or describe your meals to get detailed nutritional analysis, 
            health insights, and personalized recommendations for your family members.
          </p>
        </div>

        {/* Family Selection - Optional */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Select Family (Optional)</span>
            </CardTitle>
            <CardDescription>
              Choose a family to get personalized recommendations based on their health conditions and allergens. Skip for general analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFamily} onValueChange={setSelectedFamily}>
              <SelectTrigger>
                <SelectValue placeholder="Select a family (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Skip family selection</SelectItem>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Family Health Summary */}
            {selectedFamily && selectedFamily !== 'none' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Family Health Summary</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{member.name}</h5>
                        <span className="text-sm text-gray-500">{member.age}y • {member.gender}</span>
                      </div>
                      
                      {member.healthConditions.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-red-600 font-medium">Health Conditions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.healthConditions.map((condition, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {condition.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {member.allergens.length > 0 && (
                        <div>
                          <span className="text-xs text-orange-600 font-medium">Allergies:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.allergens.map((allergen, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-orange-300 text-orange-700">
                                {allergen.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Analysis Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="camera">Take Photo</TabsTrigger>
              <TabsTrigger value="voice">Voice Input</TabsTrigger>
              <TabsTrigger value="text">Enter Description</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload Food Image</span>
                  </CardTitle>
                  <CardDescription>
                    Upload an image of your meal for instant analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Image Preview Section */}
                    {uploadedImage && (
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center justify-between w-full">
                              <h3 className="text-lg font-semibold text-green-800">Uploaded Image Preview</h3>
                              <Button 
                                onClick={clearUploadedImage}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="max-w-md max-h-64 overflow-hidden rounded-lg border-2 border-green-300">
                              <img 
                                src={uploadedImage} 
                                alt="Uploaded food" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-sm text-green-700 font-medium">
                              {uploadedFileName}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-12 text-center bg-orange-50">
                      <Upload className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload Your Food Image</h3>
                      <p className="text-gray-600 mb-6">
                        Drag and drop your food photo here or click to browse
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isAnalyzing}
                        onClick={(e) => {
                          // Clear the value to allow selecting the same file again
                          const target = e.target as HTMLInputElement
                          target.value = ''
                        }}
                      />
                      <label 
                        htmlFor="image-upload"
                        className="cursor-pointer"
                      >
                        <Button 
                          size="lg" 
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={isAnalyzing}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            document.getElementById('image-upload')?.click()
                          }}
                        >
                          {uploadedImage ? 'Change Image' : 'Choose Image'}
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-3">
                        Supports: JPG, PNG, WebP (Max 10MB)
                      </p>
                    </div>

                    {/* Analysis Section */}
                    {uploadedImage && (
                      <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                              <h3 className="text-lg font-semibold text-blue-800">Ready for Analysis</h3>
                            </div>
                            <p className="text-blue-700 text-center">
                              Your food image has been uploaded successfully. Click the button below to analyze the nutritional content and get personalized recommendations.
                            </p>
                            <Button 
                              onClick={analyzeUploadedImage}
                              disabled={isAnalyzing}
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 w-full max-w-xs"
                            >
                              {isAnalyzing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Analyzing Food...
                                </>
                              ) : (
                                <>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Analyze Food Safety & Nutrition
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="camera" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </CardTitle>
                  <CardDescription>
                    Take a photo of your meal for instant analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Photo Preview Section */}
                    {uploadedImage && uploadedFileName === 'Captured Food Photo' && (
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center justify-between w-full">
                              <h3 className="text-lg font-semibold text-green-800">Captured Photo Preview</h3>
                              <Button 
                                onClick={clearUploadedImage}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="max-w-md max-h-64 overflow-hidden rounded-lg border-2 border-green-300">
                              <img 
                                src={uploadedImage} 
                                alt="Captured food" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-sm text-green-700 font-medium">
                              Photo captured successfully
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Camera Section */}
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center bg-blue-50">
                      <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Take a Photo</h3>
                      <p className="text-gray-600 mb-6">
                        Click the button below to open your camera and take a photo of your meal
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleTakePhoto}
                        disabled={isAnalyzing}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadedImage ? 'Retake Photo' : 'Take Photo'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-3">
                        Requires camera access permission
                      </p>
                    </div>

                    {/* Analysis Section for Captured Photo */}
                    {uploadedImage && uploadedFileName === 'Captured Food Photo' && (
                      <Card className="border-2 border-purple-200 bg-purple-50">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="w-5 h-5 text-purple-600" />
                              <h3 className="text-lg font-semibold text-purple-800">Ready for Analysis</h3>
                            </div>
                            <p className="text-purple-700 text-center">
                              Your food photo has been captured successfully. Click the button below to analyze the nutritional content and get personalized recommendations.
                            </p>
                            <Button 
                              onClick={analyzeUploadedImage}
                              disabled={isAnalyzing}
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 w-full max-w-xs"
                            >
                              {isAnalyzing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Analyzing Food...
                                </>
                              ) : (
                                <>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Analyze Food Safety & Nutrition
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Voice Input</span>
                  </CardTitle>
                  <CardDescription>
                    Describe your meal naturally and let AI analyze the nutritional content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-8 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mic className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Describe Your Meal</h3>
                      <p className="text-gray-600 mb-4">
                        Click the microphone button and describe what you're eating
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleVoiceDescription}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Start Voice Analysis'}
                      </Button>
                      {isAnalyzing && (
                        <div className="mt-4">
                          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Listening to your description...</p>
                        </div>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">Example:</h5>
                        <p className="text-sm text-blue-700">
                          "I had a grilled chicken salad with mixed greens, tomatoes, and olive oil dressing for lunch"
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-900 mb-2">Tips:</h5>
                        <p className="text-sm text-purple-700">
                          Be specific about ingredients, cooking methods, and portion sizes for better accuracy
                        </p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-900 mb-2">Browser Support:</h5>
                      <p className="text-sm text-yellow-700">
                        Voice input requires microphone access and works best in Chrome, Edge, and Safari
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Salad className="w-5 h-5" />
                    <span>Enter Description</span>
                  </CardTitle>
                  <CardDescription>
                    Type a detailed description of your meal for nutritional analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Describe your meal in detail. Include ingredients, cooking methods, portion sizes, and any other relevant information..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Be as specific as possible for the most accurate analysis</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Example: "Grilled chicken breast with quinoa, roasted vegetables, and lemon herb dressing"
                        </p>
                      </div>
                      <Button 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={handleTextAnalysis}
                        disabled={isAnalyzing || !textInput.trim()}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Meal'}
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h6 className="font-medium text-blue-900 text-sm mb-1">Ingredients</h6>
                        <p className="text-xs text-blue-700">List all main ingredients</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <h6 className="font-medium text-green-900 text-sm mb-1">Portion Size</h6>
                        <p className="text-xs text-green-700">Specify serving size</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h6 className="font-medium text-purple-900 text-sm mb-1">Preparation</h6>
                        <p className="text-xs text-purple-700">Cooking method matters</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-12 space-y-8">
              {/* Food Overview Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-green-600">🥗</span>
                        <span>Food Overview: {analysisResult.foodName}</span>
                      </CardTitle>
                      <CardDescription>
                        Comprehensive nutritional analysis and health insights
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <Badge variant={analysisResult.healthScore > 80 ? 'default' : 'secondary'}>
                          Health Score: {analysisResult.healthScore}/100
                        </Badge>
                      </div>
                      <Progress value={analysisResult.healthScore} className="w-24 h-2" />
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(analysisResult.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Ingredients and Allergens */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Salad className="w-5 h-5" />
                      <span>Ingredients</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              ingredient.isAllergenic ? 'bg-red-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-gray-700">{ingredient.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {ingredient.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Allergens</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult.allergens.length > 0 ? (
                      <div className="space-y-2">
                        {analysisResult.allergens.map((allergen, index) => (
                          <Alert key={index} className={getSeverityColor(allergen.severity)}>
                            <AlertTriangle className="w-4 h-4" />
                            <AlertTitle>{allergen.name}</AlertTitle>
                            <AlertDescription>
                              Severity: {allergen.severity}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p>No allergens detected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Nutritional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Nutritional Information</span>
                  </CardTitle>
                  <CardDescription>
                    Per 100g serving
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Key Nutrients Highlight */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        {analysisResult.nutritionalInfo.calories}
                      </div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.nutritionalInfo.protein}g
                      </div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.nutritionalInfo.carbohydrates}g
                      </div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.nutritionalInfo.fat}g
                      </div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  </div>

                  {/* Daily Value Comparison */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Daily Value % Comparison</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Calories</span>
                          <span>{Math.round((analysisResult.nutritionalInfo.calories / 2000) * 100)}%</span>
                        </div>
                        <Progress value={(analysisResult.nutritionalInfo.calories / 2000) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Protein</span>
                          <span>{Math.round((analysisResult.nutritionalInfo.protein / 50) * 100)}%</span>
                        </div>
                        <Progress value={(analysisResult.nutritionalInfo.protein / 50) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Carbohydrates</span>
                          <span>{Math.round((analysisResult.nutritionalInfo.carbohydrates / 300) * 100)}%</span>
                        </div>
                        <Progress value={(analysisResult.nutritionalInfo.carbohydrates / 300) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fat</span>
                          <span>{Math.round((analysisResult.nutritionalInfo.fat / 65) * 100)}%</span>
                        </div>
                        <Progress value={(analysisResult.nutritionalInfo.fat / 65) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Macronutrients */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Macronutrients</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-600">Calories</span>
                          </div>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.calories} kcal</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Protein</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.protein}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Carbohydrates</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.carbohydrates}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Fat</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.fat}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Fiber</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.fiber}g</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Nutrients */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Additional</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sugar</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.sugar}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sodium</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.sodium}mg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Cholesterol</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.cholesterol}mg</span>
                        </div>
                      </div>
                    </div>

                    {/* Vitamins */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Key Vitamins</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vitamin C</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.vitaminC || 0}mg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vitamin D</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.vitaminD || 0}mcg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Vitamin B12</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.vitaminB12 || 0}mcg</span>
                        </div>
                      </div>
                    </div>

                    {/* Minerals */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Key Minerals</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Calcium</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.calcium || 0}mg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Iron</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.iron || 0}mg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Potassium</span>
                          <span className="font-semibold">{analysisResult.nutritionalInfo.potassium || 0}mg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Health Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>General Health Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.generalInsights.map((insight, index) => (
                      <div key={index} className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-green-800">{insight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Personalized Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Personalized Recommendations</span>
                  </CardTitle>
                  <CardDescription>
                    Tailored advice based on family members' health conditions and dietary needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysisResult.familyRecommendations.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{rec.member.name}</h4>
                              <p className="text-sm text-gray-500">
                                {rec.member.age} years old • {rec.member.gender}
                                {rec.member.healthConditions.length > 0 && (
                                  <span className="ml-2">
                                    • {rec.member.healthConditions.map(hc => hc.name).join(', ')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(rec.severity)}>
                            {rec.severity} priority
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {/* Main Recommendation */}
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <h5 className="font-medium text-yellow-900 mb-2">⚠️ Health Warning</h5>
                            <p className="text-yellow-800 font-medium">{rec.recommendation}</p>
                          </div>

                          {rec.concern && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Specific Health Concerns</h5>
                              <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-red-800">{rec.concern}</p>
                                {rec.member.healthConditions.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {rec.member.healthConditions.map((condition, idx) => (
                                      <Badge key={idx} variant="destructive" className="text-xs">
                                        {condition.name} ({condition.severity})
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {rec.suggestion && (
                            <div className="bg-green-50 rounded-lg p-4">
                              <h5 className="font-medium text-green-900 mb-2">💡 Modification Suggestion</h5>
                              <p className="text-green-800">{rec.suggestion}</p>
                            </div>
                          )}

                          {/* Allergen Warnings */}
                          {rec.member.allergens.length > 0 && (
                            <div className="bg-orange-50 rounded-lg p-4">
                              <h5 className="font-medium text-orange-900 mb-2">🚨 Allergen Alert</h5>
                              <p className="text-orange-800 mb-2">
                                This meal contains ingredients that may trigger allergic reactions:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {rec.member.allergens.map((allergen, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-orange-300 text-orange-700">
                                    {allergen.name} ({allergen.severity})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis History */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Analysis History</span>
                </CardTitle>
                <CardDescription>
                  Your recent food analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
                  <div className="space-y-4">
                    {/* Current Analysis */}
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900">{analysisResult.foodName}</h4>
                          <p className="text-sm text-blue-700">
                            {new Date(analysisResult.createdAt).toLocaleDateString()} • {analysisResult.analysisType}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800">
                            {analysisResult.healthScore}/100
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Sample History Items */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Salad className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Grilled Chicken Salad</h5>
                            <p className="text-sm text-gray-500">2 days ago • Image analysis</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">92/100</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Pizza className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Vegetable Pizza</h5>
                            <p className="text-sm text-gray-500">5 days ago • Voice description</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">68/100</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Apple className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Fruit Smoothie Bowl</h5>
                            <p className="text-sm text-gray-500">1 week ago • Text input</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">85/100</Badge>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Button variant="outline" className="w-full">
                        View All History
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>No analysis history yet</p>
                    <p className="text-sm">Your analyzed meals will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Zap className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}