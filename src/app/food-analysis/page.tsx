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
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [families, setFamilies] = useState<any[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [textInput, setTextInput] = useState('')

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

    setIsAnalyzing(true)
    try {
      // Convert image to base64 for API processing
      const base64Image = await fileToBase64(file)
      
      // Call the food analysis API
      const response = await fetch('/api/food-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          analysisType: 'image',
          imageUrl: base64Image,
          userId: 'demo-user', // In real app, get from auth
          familyId: selectedFamily || undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult(result.data)
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Image analysis failed:', error)
      // Fallback to mock data for demo
      await mockImageAnalysis()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTakePhoto = async () => {
    setIsAnalyzing(true)
    try {
      // Request camera access and take photo
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
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
      const base64Image = canvas.toDataURL('image/jpeg')
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop())

      // Call analysis API
      const response = await fetch('/api/food-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: 'Captured Food',
          analysisType: 'image',
          imageUrl: base64Image,
          userId: 'demo-user',
          familyId: selectedFamily || undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult(result.data)
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Photo capture failed:', error)
      // Fallback to mock data
      await mockImageAnalysis()
    } finally {
      setIsAnalyzing(false)
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

      // Call analysis API with voice transcript
      const response = await fetch('/api/food-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: 'Voice Described Food',
          description: transcript,
          analysisType: 'voice',
          input: transcript,
          userId: 'demo-user',
          familyId: selectedFamily || undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult(result.data)
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Voice analysis failed:', error)
      // Fallback to mock data
      await mockVoiceAnalysis()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/food-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: textInput.split(',')[0] || textInput, // Use first part as food name
          description: textInput,
          analysisType: 'text',
          input: textInput,
          userId: 'demo-user',
          familyId: selectedFamily || undefined
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setAnalysisResult(result.data)
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Text analysis failed:', error)
      // Fallback to mock data
      await mockTextAnalysis()
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

  // Mock analysis functions for fallback
  const mockImageAnalysis = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult: FoodAnalysisResult = {
      id: '1',
      foodName: 'Chicken Shawarma',
      description: 'Middle Eastern grilled chicken wrap',
      analysisType: 'image',
      createdAt: new Date().toISOString(),
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
        { name: 'Garlic sauce', category: 'sauce', isAllergenic: true },
        { name: 'Spices (cumin, paprika)', category: 'spice', isAllergenic: false }
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
      ],
      familyRecommendations: selectedFamily ? [
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
      familyRecommendations: selectedFamily ? [
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

  const mockTextAnalysis = async () => {
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
      familyRecommendations: selectedFamily ? [
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
                <SelectItem value="">Skip family selection</SelectItem>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Family Health Summary */}
            {selectedFamily && (
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
                      />
                      <label htmlFor="image-upload">
                        <Button 
                          size="lg" 
                          className="bg-green-600 hover:bg-green-700 cursor-pointer"
                          disabled={isAnalyzing}
                          asChild
                        >
                          <span>
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Food Safety'}
                          </span>
                        </Button>
                      </label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">Supported Formats:</h5>
                        <p className="text-sm text-blue-700">
                          JPG, PNG, WebP (Max 10MB)
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-900 mb-2">Tips:</h5>
                        <p className="text-sm text-purple-700">
                          Ensure good lighting and clear focus for best results
                        </p>
                      </div>
                    </div>
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
                        {isAnalyzing ? 'Analyzing...' : 'Take Photo & Analyze'}
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 mb-2">Camera Access:</h5>
                        <p className="text-sm text-green-700">
                          Allow camera permissions when prompted
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-900 mb-2">Lighting:</h5>
                        <p className="text-sm text-yellow-700">
                          Use natural light for best food recognition
                        </p>
                      </div>
                    </div>
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