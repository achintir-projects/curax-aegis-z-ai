'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Eye, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Activity,
  Brain,
  Heart,
  Bone,
  Eye as EyeIcon,
  FileImage,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Maximize,
  Thermometer,
  Stethoscope
} from 'lucide-react'

interface ImageFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadDate: Date
  status: 'uploading' | 'analyzing' | 'completed' | 'error'
  progress: number
  analysis?: {
    findings: string[]
    confidence: number
    recommendations: string[]
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }
}

interface AnalysisResult {
  id: string
  imageId: string
  type: 'xray' | 'mri' | 'ct' | 'ultrasound' | 'other'
  findings: {
    title: string
    description: string
    confidence: number
    severity: 'normal' | 'mild' | 'moderate' | 'severe'
  }[]
  overallAssessment: string
  recommendations: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
  analyzedAt: Date
}

const sampleAnalysisResults: AnalysisResult[] = [
  {
    id: '1',
    imageId: 'sample1',
    type: 'xray',
    findings: [
      {
        title: 'Lung Fields',
        description: 'Clear lung fields with no evidence of consolidation, effusion, or pneumothorax.',
        confidence: 95,
        severity: 'normal'
      },
      {
        title: 'Cardiac Silhouette',
        description: 'Normal cardiac size and contour. No evidence of cardiomegaly.',
        confidence: 92,
        severity: 'normal'
      },
      {
        title: 'Bony Structures',
        description: 'No acute fractures or dislocations noted. Mild degenerative changes in the shoulder joints.',
        confidence: 88,
        severity: 'mild'
      }
    ],
    overallAssessment: 'Normal chest X-ray with mild degenerative changes in shoulder joints. No acute cardiopulmonary abnormalities detected.',
    recommendations: [
      'Consider follow-up with primary care physician for shoulder pain management',
      'Routine follow-up not required unless symptoms develop',
      'Maintain current treatment plan'
    ],
    urgency: 'low',
    analyzedAt: new Date(Date.now() - 3600000)
  }
]

export default function MedicalImaging() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>(sampleAnalysisResults)
  const [isDragging, setIsDragging] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const newImage: ImageFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadDate: new Date(),
          status: 'uploading',
          progress: 0
        }
        
        setImages(prev => [...prev, newImage])
        
        // Simulate upload progress
        simulateUpload(newImage.id)
      }
    })
  }

  const simulateUpload = (imageId: string) => {
    const interval = setInterval(() => {
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, progress: Math.min(100, img.progress + 10) }
            : img
        )
      )
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, status: 'analyzing', progress: 100 }
            : img
        )
      )
      
      // Simulate analysis
      setTimeout(() => {
        setImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { 
                  ...img, 
                  status: 'completed',
                  analysis: {
                    findings: ['No acute abnormalities detected', 'Normal anatomical structures'],
                    confidence: 94,
                    recommendations: ['Routine follow-up', 'No immediate intervention required'],
                    urgency: 'low'
                  }
                }
              : img
          )
        )
        
        // Add analysis result
        const newAnalysisResult: AnalysisResult = {
          id: Date.now().toString(),
          imageId,
          type: 'xray',
          findings: [
            {
              title: 'General Assessment',
              description: 'No acute abnormalities detected in the uploaded image.',
              confidence: 94,
              severity: 'normal'
            }
          ],
          overallAssessment: 'Normal study with no significant findings requiring immediate attention.',
          recommendations: ['Routine follow-up recommended', 'Continue current treatment plan'],
          urgency: 'low',
          analyzedAt: new Date()
        }
        
        setAnalysisResults(prev => [...prev, newAnalysisResult])
      }, 3000)
    }, 2000)
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    if (selectedImage?.id === imageId) {
      setSelectedImage(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: ImageFile['status']) => {
    switch (status) {
      case 'uploading': return 'bg-blue-100 text-blue-800'
      case 'analyzing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: AnalysisResult['urgency']) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: 'normal' | 'mild' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'normal': return 'text-green-600'
      case 'mild': return 'text-yellow-600'
      case 'moderate': return 'text-orange-600'
      case 'severe': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(200, prev + 25))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(50, prev - 25))
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Medical Imaging Analysis</h1>
              <Badge variant="outline">AI-Powered</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
                <TabsTrigger value="results">Analysis Results</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                {/* Upload Area */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Medical Images</CardTitle>
                    <CardDescription>
                      Drag and drop your medical images or click to browse. Supported formats: DICOM, JPEG, PNG, TIFF
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Drop your images here</h4>
                      <p className="text-gray-600 mb-4">
                        or click to browse files
                      </p>
                      <Button variant="outline">
                        Select Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.dcm"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Uploaded Images */}
                {images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Uploaded Images</CardTitle>
                      <CardDescription>
                        {images.length} image(s) uploaded and processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {images.map((image) => (
                          <div key={image.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FileImage className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{image.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {formatFileSize(image.size)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(image.status)}>
                                  {image.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImage(image.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {image.status === 'uploading' && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Uploading...</span>
                                  <span>{image.progress}%</span>
                                </div>
                                <Progress value={image.progress} className="w-full" />
                              </div>
                            )}
                            
                            {image.status === 'analyzing' && (
                              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing image...</span>
                              </div>
                            )}
                            
                            {image.status === 'completed' && image.analysis && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600">Analysis Complete</span>
                                  <span>{image.analysis.confidence}% confidence</span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedImage(image)}
                                  className="w-full"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Results
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                {analysisResults.length > 0 ? (
                  <div className="space-y-4">
                    {analysisResults.map((result) => (
                      <Card key={result.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-2">
                                <Activity className="w-5 h-5" />
                                <span>Analysis Results</span>
                              </CardTitle>
                              <CardDescription>
                                {result.type.toUpperCase()} • Analyzed {result.analyzedAt.toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge className={getUrgencyColor(result.urgency)}>
                              {result.urgency.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Overall Assessment</h4>
                              <p className="text-gray-700">{result.overallAssessment}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Findings</h4>
                              <div className="space-y-3">
                                {result.findings.map((finding, index) => (
                                  <div key={index} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium">{finding.title}</h5>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline">
                                          {finding.confidence}% confidence
                                        </Badge>
                                        <span className={`text-sm font-medium ${getSeverityColor(finding.severity)}`}>
                                          {finding.severity}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{finding.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Recommendations</h4>
                              <ul className="space-y-1">
                                {result.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-gray-700">
                                    • {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-2">
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Results
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No Analysis Results</h4>
                      <p className="text-gray-600 text-center mb-4">
                        Upload and analyze medical images to see results here
                      </p>
                      <Button onClick={() => document.querySelector('[value="upload"]')?.click()}>
                        Upload Images
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis History</CardTitle>
                    <CardDescription>
                      Previous medical image analyses and results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{result.type.toUpperCase()} Analysis</p>
                              <p className="text-sm text-gray-600">
                                {result.analyzedAt.toLocaleDateString()} • {result.analyzedAt.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getUrgencyColor(result.urgency)}>
                              {result.urgency}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Image Types */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Image Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Bone className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">X-Ray (DICOM, JPEG)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">MRI (DICOM, NIfTI)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-sm">CT Scan (DICOM)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-5 h-5 text-red-600" />
                  <span className="text-sm">Ultrasound</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EyeIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm">Retinal Images</span>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle>AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Anomaly detection</p>
                <p>• Tumor identification</p>
                <p>• Fracture detection</p>
                <p>• Organ measurement</p>
                <p>• Comparative analysis</p>
                <p>• Severity assessment</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Images Uploaded</span>
                  <span className="font-medium">{images.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analyses Complete</span>
                  <span className="font-medium">{analysisResults.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Confidence</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <span className="font-medium">2.3s avg</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Use high-quality images</p>
                <p>• Ensure proper lighting</p>
                <p>• Include patient metadata</p>
                <p>• Use standard formats</p>
                <p>• Check image orientation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}