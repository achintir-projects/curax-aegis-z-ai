'use client'

import Link from 'next/link'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Stethoscope, 
  Brain, 
  Mic, 
  Image as ImageIcon, 
  Shield, 
  Globe,
  Activity,
  Heart,
  Users,
  BarChart3,
  FileText,
  Video,
  Phone,
  Lock,
  Server
} from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Curax AI</h1>
                <p className="text-xs text-gray-500">Project Aegis</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#diagnosis" className="text-gray-600 hover:text-gray-900 transition-colors">Diagnosis</a>
              <a href="#imaging" className="text-gray-600 hover:text-gray-900 transition-colors">Imaging</a>
              <a href="#security" className="text-gray-600 hover:text-gray-900 transition-colors">Security</a>
            </nav>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-emerald-100 text-emerald-800">
            AI-Powered Healthcare Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Advanced Medical AI for
            <span className="text-emerald-600 block">Precision Diagnosis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of healthcare with our cutting-edge AI platform. 
            Voice-enabled diagnosis, medical imaging analysis, and intelligent health monitoring 
            powered by state-of-the-art artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Start Diagnosis
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive AI Healthcare</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform integrates multiple AI technologies to provide a complete healthcare solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Voice Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Natural conversation with AI for symptom analysis and preliminary diagnosis
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Medical Imaging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered analysis of X-rays, MRIs, and other medical images
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">AI Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced LLMs trained on medical data for accurate diagnosis
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Multi-Language</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Support for multiple languages with real-time translation
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="diagnosis" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interactive Diagnosis</h2>
            <p className="text-gray-600">Experience our AI-powered voice diagnosis system</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="voice">Voice Interface</TabsTrigger>
                <TabsTrigger value="imaging">Imaging Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>
                      Comprehensive view of all available features and capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold">Real-time Monitoring</h4>
                            <p className="text-sm text-gray-600">Continuous health data analysis</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold">Cardiac Analysis</h4>
                            <p className="text-sm text-gray-600">Advanced heart health monitoring</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold">Multi-Patient Support</h4>
                            <p className="text-sm text-gray-600">Manage multiple patient profiles</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <BarChart3 className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold">Analytics Dashboard</h4>
                            <p className="text-sm text-gray-600">Comprehensive health analytics</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold">Medical Reports</h4>
                            <p className="text-sm text-gray-600">Detailed diagnostic reports</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Video className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold">Telemedicine Integration</h4>
                            <p className="text-sm text-gray-600">Seamless video consultation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Diagnosis Interface</CardTitle>
                    <CardDescription>
                      Interactive voice-powered symptom analysis and diagnosis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mic className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Ready to Start Diagnosis</h4>
                        <p className="text-gray-600 mb-4">
                          Click the microphone button and describe your symptoms naturally
                        </p>
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                          <Mic className="w-5 h-5 mr-2" />
                          Start Voice Diagnosis
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">Speech-to-Text</h5>
                          <p className="text-sm text-blue-700">
                            Advanced Google Cloud STT for accurate medical terminology recognition
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-semibold text-green-900 mb-2">Text-to-Speech</h5>
                          <p className="text-sm text-green-700">
                            Natural voice responses with medical professional tone
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="imaging" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Imaging Analysis</CardTitle>
                    <CardDescription>
                      AI-powered analysis of medical images with detailed annotations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="font-semibold mb-2">Upload Medical Image</h4>
                        <p className="text-gray-600 mb-4">
                          Drag and drop X-rays, MRIs, or other medical images here
                        </p>
                        <Button variant="outline">
                          Select Files
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Activity className="w-6 h-6 text-purple-600" />
                          </div>
                          <h5 className="font-semibold">X-Ray Analysis</h5>
                          <p className="text-sm text-gray-600">Chest, bone, and dental X-rays</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Brain className="w-6 h-6 text-purple-600" />
                          </div>
                          <h5 className="font-semibold">MRI Processing</h5>
                          <p className="text-sm text-gray-600">Brain and body MRI analysis</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Heart className="w-6 h-6 text-purple-600" />
                          </div>
                          <h5 className="font-semibold">CT Scans</h5>
                          <p className="text-sm text-gray-600">Computed tomography analysis</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security & Compliance</h2>
            <p className="text-gray-600">Enterprise-grade security for sensitive medical data</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600">
                Full compliance with healthcare data protection regulations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600">
                All data encrypted in transit and at rest
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Infrastructure</h3>
              <p className="text-gray-600">
                Enterprise-grade cloud infrastructure with regular security audits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-emerald-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience the Future of Healthcare?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join healthcare professionals worldwide who are already using Curax AI 
            to provide better patient care through advanced AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Schedule a Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Curax AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced AI-powered healthcare platform for precision diagnosis and patient care.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Voice Diagnosis</a></li>
                <li><a href="#" className="hover:text-white">Medical Imaging</a></li>
                <li><a href="#" className="hover:text-white">AI Analytics</a></li>
                <li><a href="#" className="hover:text-white">Telemedicine</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Status</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Curax AI. All rights reserved. Project Aegis - Secure Healthcare AI Platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}