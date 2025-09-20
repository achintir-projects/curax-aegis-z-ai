'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Stethoscope, 
  Mic, 
  Image as ImageIcon, 
  Brain, 
  Activity,
  Heart,
  Users,
  BarChart3,
  FileText,
  Video,
  Phone,
  Bell,
  Settings,
  LogOut,
  Plus,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const recentPatients = [
    { name: 'John Doe', age: 45, condition: 'Chest Pain', lastVisit: '2 hours ago', status: 'urgent' },
    { name: 'Jane Smith', age: 32, condition: 'Headache', lastVisit: '5 hours ago', status: 'normal' },
    { name: 'Robert Johnson', age: 58, condition: 'Blood Pressure', lastVisit: '1 day ago', status: 'follow-up' },
    { name: 'Maria Garcia', age: 29, condition: 'Skin Rash', lastVisit: '2 days ago', status: 'normal' },
  ]

  const recentDiagnoses = [
    { patient: 'John Doe', type: 'Voice Diagnosis', result: 'Possible respiratory infection', confidence: '85%', time: '2 hours ago' },
    { patient: 'Jane Smith', type: 'Image Analysis', result: 'No abnormalities detected', confidence: '92%', time: '5 hours ago' },
    { patient: 'Robert Johnson', type: 'Voice Diagnosis', result: 'Hypertension indicators', confidence: '78%', time: '1 day ago' },
  ]

  const stats = [
    { title: 'Total Patients', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Diagnoses Today', value: '24', change: '+8%', icon: Brain, color: 'text-purple-600' },
    { title: 'Active Cases', value: '18', change: '+5%', icon: Activity, color: 'text-green-600' },
    { title: 'Accuracy Rate', value: '94.2%', change: '+2.1%', icon: TrendingUp, color: 'text-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Curax AI</h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Cardiologist</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Patients */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patients</CardTitle>
                  <CardDescription>Latest patient visits and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPatients.map((patient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.age} years • {patient.condition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={patient.status === 'urgent' ? 'destructive' : patient.status === 'follow-up' ? 'default' : 'secondary'}
                          >
                            {patient.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{patient.lastVisit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Patients
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Diagnoses */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Diagnoses</CardTitle>
                  <CardDescription>Latest AI-powered diagnostic results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDiagnoses.map((diagnosis, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{diagnosis.patient}</p>
                          <Badge variant="outline">{diagnosis.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{diagnosis.result}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">{diagnosis.confidence} confidence</span>
                          </div>
                          <span className="text-xs text-gray-500">{diagnosis.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Diagnoses
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/voice-diagnosis">
                    <Button className="h-20 flex-col space-y-2 bg-emerald-600 hover:bg-emerald-700">
                      <Mic className="w-6 h-6" />
                      <span>Voice Diagnosis</span>
                    </Button>
                  </Link>
                  <Link href="/medical-imaging">
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <ImageIcon className="w-6 h-6" />
                      <span>Image Analysis</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Plus className="w-6 h-6" />
                    <span>New Patient</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <FileText className="w-6 h-6" />
                    <span>Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>Manage and view all patient records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>All Status</option>
                      <option>Urgent</option>
                      <option>Normal</option>
                      <option>Follow-up</option>
                    </select>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Patient</th>
                        <th className="text-left py-3 px-4">Age</th>
                        <th className="text-left py-3 px-4">Condition</th>
                        <th className="text-left py-3 px-4">Last Visit</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map((patient, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{patient.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{patient.age}</td>
                          <td className="py-3 px-4">{patient.condition}</td>
                          <td className="py-3 px-4">{patient.lastVisit}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={patient.status === 'urgent' ? 'destructive' : patient.status === 'follow-up' ? 'default' : 'secondary'}
                            >
                              {patient.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Voice Diagnosis</span>
                  </CardTitle>
                  <CardDescription>Start a new voice-powered diagnostic session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">Ready to Start Diagnosis</h4>
                    <p className="text-gray-600 mb-6">
                      Click the button below and describe your symptoms naturally
                    </p>
                    <Link href="/voice-diagnosis">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        <Mic className="w-5 h-5 mr-2" />
                        Start Voice Diagnosis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Image Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Medical Imaging</span>
                  </CardTitle>
                  <CardDescription>Upload and analyze medical images</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>

            {/* Recent Diagnoses */}
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic History</CardTitle>
                <CardDescription>Recent diagnostic sessions and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDiagnoses.map((diagnosis, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            diagnosis.type === 'Voice Diagnosis' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {diagnosis.type === 'Voice Diagnosis' ? 
                              <Mic className="w-5 h-5 text-blue-600" /> : 
                              <ImageIcon className="w-5 h-5 text-purple-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{diagnosis.patient}</p>
                            <p className="text-sm text-gray-600">{diagnosis.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{diagnosis.confidence} confidence</Badge>
                          <p className="text-xs text-gray-500 mt-1">{diagnosis.time}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{diagnosis.result}</p>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Download Report</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Diagnostic Accuracy</CardTitle>
                  <CardDescription>AI model performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Accuracy charts will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient Demographics</CardTitle>
                  <CardDescription>Age and condition distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Demographic charts will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold">System Status</h4>
                    <p className="text-green-600 font-medium">Operational</p>
                    <p className="text-sm text-gray-600">99.9% uptime</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">AI Models</h4>
                    <p className="text-blue-600 font-medium">Active</p>
                    <p className="text-sm text-gray-600">3 models running</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">Response Time</h4>
                    <p className="text-purple-600 font-medium">1.2s avg</p>
                    <p className="text-sm text-gray-600">Last 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}