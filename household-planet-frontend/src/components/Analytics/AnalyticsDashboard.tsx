'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  pageViews: { page: string; views: number }[]
  conversions: { event: string; count: number }[]
  userJourney: { stage: string; users: number }[]
  topProducts: { name: string; views: number; conversions: number }[]
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch from your analytics API
    // For now, we'll use mock data
    const mockData: AnalyticsData = {
      pageViews: [
        { page: '/', views: 1250 },
        { page: '/products', views: 890 },
        { page: '/cart', views: 340 },
        { page: '/checkout', views: 120 }
      ],
      conversions: [
        { event: 'Purchase', count: 45 },
        { event: 'Add to Cart', count: 180 },
        { event: 'Newsletter Signup', count: 67 },
        { event: 'WhatsApp Click', count: 234 }
      ],
      userJourney: [
        { stage: 'Homepage', users: 1000 },
        { stage: 'Product Discovery', users: 750 },
        { stage: 'Product View', users: 500 },
        { stage: 'Add to Cart', users: 200 },
        { stage: 'Checkout', users: 80 },
        { stage: 'Purchase', users: 45 }
      ],
      topProducts: [
        { name: 'Kitchen Set', views: 234, conversions: 12 },
        { name: 'Dining Table', views: 189, conversions: 8 },
        { name: 'Sofa Set', views: 156, conversions: 6 },
        { name: 'Bed Frame', views: 134, conversions: 5 }
      ]
    }

    setTimeout(() => {
      setData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="p-6">Loading analytics...</div>
  }

  if (!data) {
    return <div className="p-6">No analytics data available</div>
  }

  const COLORS = ['#ea580c', '#fb923c', '#fed7aa', '#ffedd5']

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.pageViews.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.conversions.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((45 / 1250) * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 24s</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.pageViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#ea580c" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.conversions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.conversions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userJourney}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#ea580c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Products Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.views} views • {product.conversions} conversions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {((product.conversions / product.views) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">conversion rate</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
