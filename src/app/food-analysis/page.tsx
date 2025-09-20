'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  AlertTriangle
} from 'lucide-react'

export default function FoodAnalysis() {
  const [selectedTab, setSelectedTab] = useState('upload')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleImageUpload = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult({
        type: 'image',
        food: 'Grilled Chicken Salad',
        calories: 320,
        protein: 28,
        carbs: 12,
        fat: 18,
        fiber: 6,
        ingredients: ['Grilled chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil dressing'],
        healthScore: 85,
        insights: [
          'High in lean protein for muscle maintenance',
          'Good source of fiber for digestive health',
          'Contains healthy fats from olive oil',
          'Low in refined carbohydrates'
        ],
        recommendations: [
          'Consider adding quinoa for complex carbohydrates',
          'Pair with a fruit for additional vitamins',
          'Stay hydrated to support digestion'
        ]
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleVoiceDescription = () => {
    setIsAnalyzing(true)
    // Simulate voice analysis
    setTimeout(() => {
      setAnalysisResult({
        type: 'voice',
        food: 'Breakfast Bowl',
        description: 'Oatmeal with berries and nuts',
        calories: 380,
        protein: 12,
        carbs: 58,
        fat: 14,
        fiber: 8,
        ingredients: ['Rolled oats', 'Mixed berries', 'Almonds', 'Honey', 'Greek yogurt'],
        healthScore: 78,
        insights: [
          'Complex carbohydrates provide sustained energy',
          'Antioxidants from berries support immune health',
          'Healthy fats and protein from nuts and yogurt',
          'High fiber content promotes satiety'
        ],
        recommendations: [
          'Consider adding chia seeds for omega-3 fatty acids',
          'Perfect pre-workout meal for energy',
          'Adjust honey quantity based on sugar preferences'
        ]
      })
      setIsAnalyzing(false)
    }, 2000)
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
            Smart Food Analysis for
            <span className="text-orange-600 block">Better Health</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload food images or describe your meals to get detailed nutritional analysis, 
            health insights, and personalized recommendations.
          </p>
        </div>

        {/* Main Analysis Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="upload">Image Upload</TabsTrigger>
              <TabsTrigger value="voice">Voice Description</TabsTrigger>
              <TabsTrigger value="text">Text Input</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Upload Food Image</span>
                  </CardTitle>
                  <CardDescription>
                    Take a photo or upload an image of your meal for instant analysis
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
                      <Button 
                        size="lg" 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={handleImageUpload}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Upload and Analyze'}
                      </Button>
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
                    <span>Voice Description</span>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Salad className="w-5 h-5" />
                    <span>Text Description</span>
                  </CardTitle>
                  <CardDescription>
                    Type a detailed description of your meal for nutritional analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Textarea
                      placeholder="Describe your meal in detail. Include ingredients, cooking methods, and portion sizes..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Be as specific as possible for the most accurate analysis
                      </p>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        Analyze Meal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Analysis Results</span>
                    <Badge variant={analysisResult.healthScore > 80 ? 'default' : 'secondary'}>
                      Health Score: {analysisResult.healthScore}/100
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Detailed nutritional breakdown and health insights for {analysisResult.food}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Nutritional Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Nutritional Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Calories</span>
                          <span className="font-semibold">{analysisResult.calories} kcal</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Protein</span>
                          <span className="font-semibold">{analysisResult.protein}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Carbohydrates</span>
                          <span className="font-semibold">{analysisResult.carbs}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Fat</span>
                          <span className="font-semibold">{analysisResult.fat}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Fiber</span>
                          <span className="font-semibold">{analysisResult.fiber}g</span>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Salad className="w-5 h-5 mr-2" />
                        Ingredients
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.ingredients.map((ingredient: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-700">{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Health Insights */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Health Insights
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {analysisResult.insights.map((insight: string, index: number) => (
                        <div key={index} className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-green-800">{insight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Personalized Recommendations
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {analysisResult.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <span className="text-blue-800 text-sm">{recommendation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}