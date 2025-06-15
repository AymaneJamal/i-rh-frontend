"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, Users, Eye, ThumbsUp, TrendingUp, Activity } from "lucide-react"

const earningsData = [
  { month: "Q1", mobile: 2400, laptop: 1400, computer: 1000 },
  { month: "Q2", mobile: 1398, laptop: 2210, computer: 1200 },
  { month: "Q3", mobile: 9800, laptop: 2290, computer: 1500 },
  { month: "Q4", mobile: 3908, laptop: 2000, computer: 1800 },
  { month: "Q5", mobile: 4800, laptop: 2181, computer: 1600 },
]

const referralData = [
  { source: "Facebook", visits: 2301, color: "#3b82f6" },
  { source: "Twitter", visits: 2107, color: "#8b5cf6" },
  { source: "Search", visits: 2308, color: "#f59e0b" },
  { source: "Affiliates", visits: 1024, color: "#10b981" },
]

const pieData = [
  { name: "Desktop", value: 63, color: "#1f2937" },
  { name: "Mobile", value: 37, color: "#6b7280" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">EARNINGS</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22,500</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              19% compared to last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">SALES</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$500</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              19% compared to last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">VISITS</CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$21,215</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              19% compared to last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">LIKES</CardTitle>
            <ThumbsUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$421,215</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              19% compared to last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mobile" stackId="a" fill="#06b6d4" />
                <Bar dataKey="laptop" stackId="a" fill="#f59e0b" />
                <Bar dataKey="computer" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-cyan-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Mobile</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Laptop</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Computer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {referralData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium">{item.visits}</span>
                  <span className="text-sm text-gray-600">visits from {item.source}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Total Sale Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Total Sale</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">63</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-sm font-medium">Weekly Earnings</div>
              <div className="text-sm font-medium">Monthly Earnings</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Hello, John</div>
                  <div className="text-xs text-gray-600">What is the update on Project X?</div>
                </div>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg ml-11">
                <div className="text-sm">Hi, Alizee</div>
                <div className="text-xs text-gray-600 mt-1">Project X is on track for delivery next week.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Managed */}
        <Card>
          <CardHeader>
            <CardTitle>Data Managed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">1,523</div>
              <div className="text-sm text-gray-600">External Records</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Twitter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">862 Records</span>
                  <Badge variant="secondary" className="text-xs">
                    35% ↗
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
