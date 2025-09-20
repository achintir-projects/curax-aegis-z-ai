'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Heart, 
  Pill, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Family, FamilyMember, HealthEvent, VitalSign } from '@/types'

interface HealthSummary {
  totalMembers: number
  activeConditions: number
  currentMedications: number
  recentEvents: number
  avgBMI: number
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function FamilyDashboard() {
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [families, setFamilies] = useState<Family[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([])
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([])
  const [loading, setLoading] = useState(true)
  const [healthSummary, setHealthSummary] = useState<HealthSummary>({
    totalMembers: 0,
    activeConditions: 0,
    currentMedications: 0,
    recentEvents: 0,
    avgBMI: 0,
    healthStatus: 'good'
  })

  useEffect(() => {
    fetchFamilies()
  }, [])

  useEffect(() => {
    if (selectedFamily) {
      fetchFamilyData()
    }
  }, [selectedFamily])

  const fetchFamilies = async () => {
    try {
      const response = await fetch('/api/families')
      if (response.ok) {
        const data = await response.json()
        setFamilies(data)
        if (data.length > 0) {
          setSelectedFamily(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching families:', error)
    }
  }

  const fetchFamilyData = async () => {
    setLoading(true)
    try {
      const [membersRes, eventsRes, vitalsRes] = await Promise.all([
        fetch(`/api/family-members?familyId=${selectedFamily}`),
        fetch(`/api/health-events?familyId=${selectedFamily}`),
        fetch(`/api/vital-signs?familyId=${selectedFamily}`)
      ])

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setFamilyMembers(membersData)
        calculateHealthSummary(membersData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setHealthEvents(eventsData.slice(0, 10)) // Last 10 events
      }

      if (vitalsRes.ok) {
        const vitalsData = await vitalsRes.json()
        setVitalSigns(vitalsData)
      }
    } catch (error) {
      console.error('Error fetching family data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateHealthSummary = (members: FamilyMember[]) => {
    const totalMembers = members.length
    const activeConditions = members.reduce((sum, member) => 
      sum + (member.medicalConditions?.filter(c => c.isActive).length || 0), 0)
    const currentMedications = members.reduce((sum, member) => 
      sum + (member.medications?.filter(m => m.isActive).length || 0), 0)
    
    // Calculate average BMI
    const bmiValues = members.map(member => {
      if (member.height && member.weight) {
        const heightInMeters = member.height / 100
        return member.weight / (heightInMeters * heightInMeters)
      }
      return null
    }).filter(bmi => bmi !== null) as number[]
    
    const avgBMI = bmiValues.length > 0 
      ? bmiValues.reduce((sum, bmi) => sum + bmi, 0) / bmiValues.length 
      : 0

    // Determine health status
    let healthStatus: HealthSummary['healthStatus'] = 'good'
    if (activeConditions === 0 && avgBMI > 18.5 && avgBMI < 25) {
      healthStatus = 'excellent'
    } else if (activeConditions > 3 || avgBMI < 18.5 || avgBMI > 30) {
      healthStatus = 'fair'
    } else if (activeConditions > 5 || avgBMI < 16 || avgBMI > 35) {
      healthStatus = 'poor'
    }

    setHealthSummary({
      totalMembers,
      activeConditions,
      currentMedications,
      recentEvents: healthEvents.length,
      avgBMI,
      healthStatus
    })
  }

  const getHealthStatusColor = (status: HealthSummary['healthStatus']) => {
    switch (status) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'fair': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getHealthStatusText = (status: HealthSummary['healthStatus']) => {
    switch (status) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'fair': return 'Fair'
      case 'poor': return 'Needs Attention'
      default: return 'Unknown'
    }
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { status: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { status: 'Overweight', color: 'text-yellow-600' }
    return { status: 'Obese', color: 'text-red-600' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Health Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your family's health status and track important metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedFamily} onValueChange={setSelectedFamily}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select family" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Health Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conditions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary.activeConditions}</div>
            <p className="text-xs text-muted-foreground">
              Being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary.currentMedications}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary.recentEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getHealthStatusColor(healthSummary.healthStatus)}`}></div>
              <span className="text-lg font-semibold">{getHealthStatusText(healthSummary.healthStatus)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Avg BMI: {healthSummary.avgBMI.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Family Members Health Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {familyMembers.map((member) => {
          const bmi = member.height && member.weight 
            ? member.weight / Math.pow(member.height / 100, 2)
            : null
          const bmiStatus = bmi ? getBMIStatus(bmi) : null

          return (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>
                      {member.age} years old • {member.gender}
                    </CardDescription>
                  </div>
                  <Badge variant={member.isActive ? 'default' : 'secondary'}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals</TabsTrigger>
                    <TabsTrigger value="health">Health</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-3">
                    {bmi && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">BMI:</span>
                        <span className={`text-sm font-semibold ${bmiStatus?.color}`}>
                          {bmi.toFixed(1)} ({bmiStatus?.status})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Blood Type:</span>
                      <span className="text-sm">{member.bloodType || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Conditions:</span>
                      <Badge variant="outline">
                        {member.medicalConditions?.filter(c => c.isActive).length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Medications:</span>
                      <Badge variant="outline">
                        {member.medications?.filter(m => m.isActive).length || 0}
                      </Badge>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="vitals" className="space-y-3">
                    {member.vitalSigns && member.vitalSigns.length > 0 ? (
                      <div className="space-y-2">
                        {member.vitalSigns.slice(0, 3).map((vital) => (
                          <div key={vital.id} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{vital.type.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="font-medium">{vital.value} {vital.unit}</span>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full">
                          View All Vitals
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No vital signs recorded</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="health" className="space-y-3">
                    {member.medicalConditions && member.medicalConditions.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Conditions:</h4>
                        {member.medicalConditions.filter(c => c.isActive).slice(0, 3).map((condition) => (
                          <div key={condition.id} className="flex items-center space-x-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm">{condition.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No active conditions</p>
                    )}
                    
                    {member.medications && member.medications.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Medications:</h4>
                        {member.medications.filter(m => m.isActive).slice(0, 2).map((medication) => (
                          <div key={medication.id} className="flex items-center space-x-2">
                            <Pill className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">{medication.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Health Events Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Health Events</CardTitle>
          <CardDescription>
            Latest health activities and updates for your family
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {healthEvents.length > 0 ? (
                healthEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {event.type === 'appointment' && <Calendar className="h-5 w-5 text-blue-500" />}
                      {event.type === 'medication' && <Pill className="h-5 w-5 text-green-500" />}
                      {event.type === 'vital_signs' && <Activity className="h-5 w-5 text-purple-500" />}
                      {event.type === 'condition' && <Heart className="h-5 w-5 text-red-500" />}
                      {event.type === 'general' && <CheckCircle className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{event.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.eventDate)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      {event.familyMember && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={event.familyMember.avatar} alt={event.familyMember.name} />
                            <AvatarFallback className="text-xs">
                              {event.familyMember.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{event.familyMember.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent health events</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}