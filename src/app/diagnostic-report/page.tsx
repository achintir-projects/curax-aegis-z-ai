'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Download, 
  Share2, 
  Print, 
  Mail,
  User,
  Calendar,
  Clock,
  Activity,
  Brain,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  Heart,
  Thermometer,
  Bone,
  Eye,
  Scale,
  TrendingUp,
  Info
} from 'lucide-react'

interface DiagnosticReport {
  id: string
  patientInfo: {
    name: string
    age: number
    gender: string
    patientId: string
    dateOfBirth: string
  }
  sessionInfo: {
    sessionId: string
    date: Date
    duration: string
    type: 'voice' | 'imaging' | 'combined'
    symptoms: string[]
  }
  analysis: {
    primaryFindings: {
      title: string
      description: string
      confidence: number
      severity: 'low' | 'medium' | 'high'
    }[]
    possibleConditions: {
      condition: string
      likelihood: number
      description: string
    }[]
    riskAssessment: {
      overallRisk: 'low' | 'medium' | 'high' | 'critical'
      factors: string[]
    }
  }
  recommendations: {
    immediate: string[]
    followUp: string[]
    lifestyle: string[]
  }
  disclaimer: string
  generatedAt: Date
  validUntil: Date
}

const sampleReport: DiagnosticReport = {
  id: 'RPT-2024-001',
  patientInfo: {
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    patientId: 'P-2024-0145',
    dateOfBirth: '1979-03-15'
  },
  sessionInfo: {
    sessionId: 'SES-2024-0892',
    date: new Date('2024-01-15T14:30:00'),
    duration: '12 minutes',
    type: 'voice',
    symptoms: [
      'Sharp chest pain',
      'Shortness of breath',
      'Pain worsens with deep breathing',
      'Started 2 days ago'
    ]
  },
  analysis: {
    primaryFindings: [
      {
        title: 'Respiratory Symptoms',
        description: 'Patient reports sharp chest pain with pleuritic characteristics, accompanied by shortness of breath. Symptoms suggest possible respiratory or cardiovascular involvement.',
        confidence: 87,
        severity: 'high'
      },
      {
        title: 'Pain Characteristics',
        description: 'Pain is sharp and worsens with deep breathing, which is concerning for pleural or pulmonary involvement.',
        confidence: 82,
        severity: 'medium'
      },
      {
        title: 'Temporal Pattern',
        description: 'Symptoms started 2 days ago and appear to be persistent or worsening, which requires prompt medical evaluation.',
        confidence: 79,
        severity: 'medium'
      }
    ],
    possibleConditions: [
      {
        condition: 'Pleurisy',
        likelihood: 65,
        description: 'Inflammation of the pleura that can cause sharp chest pain worsened by breathing.'
      },
      {
        condition: 'Pulmonary Embolism',
        likelihood: 45,
        description: 'Blood clot in the lungs that can cause chest pain and shortness of breath. Requires immediate attention.'
      },
      {
        condition: 'Costochondritis',
        likelihood: 30,
        description: 'Inflammation of the cartilage connecting ribs to sternum, causing chest wall pain.'
      },
      {
        condition: 'Pneumonia',
        likelihood: 25,
        description: 'Lung infection that can cause chest pain and breathing difficulties.'
      }
    ],
    riskAssessment: {
      overallRisk: 'high',
      factors: [
        'Chest pain with respiratory symptoms',
        'Symptoms worsening over time',
        'Shortness of breath present',
        'Pain triggered by breathing'
      ]
    }
  },
  recommendations: {
    immediate: [
      'Seek immediate medical attention at nearest emergency department',
      'Avoid strenuous activity until evaluated by healthcare provider',
      'Monitor symptoms and seek immediate help if pain worsens or breathing becomes more difficult'
    ],
    followUp: [
      'Complete medical evaluation including chest X-ray or CT scan',
      'Cardiac evaluation to rule out cardiac causes',
      'Blood tests including D-dimer if pulmonary embolism suspected',
      'Follow up with primary care provider within 24-48 hours'
    ],
    lifestyle: [
      'Rest and avoid activities that exacerbate symptoms',
      'Maintain hydration',
      'Over-the-counter pain relievers may be used temporarily (consult pharmacist)',
      'Keep symptom diary for healthcare provider'
    ]
  },
  disclaimer: 'This AI-generated report is for informational purposes only and does not constitute medical advice. The analysis is based on the information provided during the session and should not replace professional medical judgment. Always consult with qualified healthcare providers for medical diagnosis and treatment. The system may not detect all conditions, and individual circumstances may vary. In case of emergency, call emergency services immediately.',
  generatedAt: new Date('2024-01-15T14:42:00'),
  validUntil: new Date('2024-01-22T14:42:00')
}

export default function DiagnosticReport() {
  const [report] = useState<DiagnosticReport>(sampleReport)
  const [activeTab, setActiveTab] = useState('overview')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 70) return 'bg-red-100 text-red-800'
    if (likelihood >= 50) return 'bg-orange-100 text-orange-800'
    if (likelihood >= 30) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Simulate PDF download
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    element.href = URL.createObjectURL(file)
    element.download = `diagnostic-report-${report.id}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleShare = () => {
    // Simulate sharing functionality
    if (navigator.share) {
      navigator.share({
        title: 'Diagnostic Report',
        text: `Diagnostic Report for ${report.patientInfo.name}`,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Report link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Diagnostic Report</h1>
                  <p className="text-xs text-gray-500">{report.id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Print className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* Report Header */}
              <div className="border-b pb-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Diagnostic Report</h2>
                    <p className="text-gray-600">AI-Powered Medical Analysis</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getRiskColor(report.analysis.riskAssessment.overallRisk)}>
                      {report.analysis.riskAssessment.overallRisk.toUpperCase()} RISK
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Report ID: {report.id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Generated</p>
                    <p className="font-medium">{report.generatedAt.toLocaleDateString()} {report.generatedAt.toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valid Until</p>
                    <p className="font-medium">{report.validUntil.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Session Type</p>
                    <p className="font-medium capitalize">{report.sessionInfo.type}</p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{report.patientInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{report.patientInfo.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{report.patientInfo.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient ID</p>
                    <p className="font-medium">{report.patientInfo.patientId}</p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Session Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Session Date</p>
                    <p className="font-medium">{report.sessionInfo.date.toLocaleDateString()} {report.sessionInfo.date.toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{report.sessionInfo.duration}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Reported Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {report.sessionInfo.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline">{symptom}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                    <CardDescription>Key findings and risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-4">
                        Based on the voice consultation session, the patient presents with concerning symptoms 
                        including sharp chest pain and shortness of breath. The AI analysis indicates a high-risk 
                        presentation that requires immediate medical attention.
                      </p>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">High Risk Assessment</h4>
                            <p className="text-sm text-yellow-700">
                              The combination of chest pain with respiratory symptoms warrants immediate medical evaluation.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mb-2">Key Risk Factors:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        {report.analysis.riskAssessment.factors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Confidence</CardTitle>
                    <CardDescription>AI model confidence levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.analysis.primaryFindings.map((finding, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{finding.title}</span>
                            <span className="text-sm text-gray-600">{finding.confidence}% confidence</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${finding.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="findings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Findings</CardTitle>
                    <CardDescription>Detailed analysis of symptoms and observations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {report.analysis.primaryFindings.map((finding, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{finding.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(finding.severity)}>
                                {finding.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{finding.confidence}% confidence</Badge>
                            </div>
                          </div>
                          <p className="text-gray-700">{finding.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conditions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Possible Conditions</CardTitle>
                    <CardDescription>AI-suggested differential diagnoses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.analysis.possibleConditions.map((condition, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{condition.condition}</h4>
                            <Badge className={getLikelihoodColor(condition.likelihood)}>
                              {condition.likelihood}% likelihood
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm">{condition.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Details</CardTitle>
                    <CardDescription>Comprehensive risk factor analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Overall Risk Level</span>
                        <Badge className={getRiskColor(report.analysis.riskAssessment.overallRisk)}>
                          {report.analysis.riskAssessment.overallRisk.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Contributing Factors:</h4>
                        <ul className="space-y-2">
                          {report.analysis.riskAssessment.factors.map((factor, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-gray-700">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Immediate Actions</CardTitle>
                      <CardDescription>Urgent recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.recommendations.immediate.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Follow-up Care</CardTitle>
                      <CardDescription>Medical follow-up needed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.recommendations.followUp.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Lifestyle</CardTitle>
                      <CardDescription>Self-care recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.recommendations.lifestyle.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Important Disclaimer</CardTitle>
                    <CardDescription>Medical guidance information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="mb-2">{report.disclaimer}</p>
                          <p className="font-semibold">In case of emergency, call emergency services immediately.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                  <Print className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email to Doctor
                </Button>
              </CardContent>
            </Card>

            {/* Report Info */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Report ID</span>
                  <span className="text-xs font-mono">{report.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Session ID</span>
                  <span className="text-xs font-mono">{report.sessionInfo.sessionId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Generated</span>
                  <span className="text-xs">{report.generatedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valid Until</span>
                  <span className="text-xs">{report.validUntil.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level</span>
                  <Badge className={getRiskColor(report.analysis.riskAssessment.overallRisk)}>
                    {report.analysis.riskAssessment.overallRisk}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-800 mb-1">Emergency Services</p>
                    <p className="text-2xl font-bold text-red-600">911</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-800 mb-1">Poison Control</p>
                    <p className="text-lg font-bold text-blue-600">1-800-222-1222</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>1. Seek immediate medical attention</p>
                <p>2. Bring this report to your appointment</p>
                <p>3. Follow all recommendations</p>
                <p>4. Monitor symptoms closely</p>
                <p>5. Keep copy for medical records</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}