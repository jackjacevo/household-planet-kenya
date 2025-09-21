'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  category: string;
  sales: number;
}

export function SimpleLineChart() {
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['salesAnalytics'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      const response = await axios.get(
        `${apiUrl}/api/admin/dashboard`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Generate monthly revenue data from orders
      const orders = response.data.recentOrders || [];
      const monthlyData: any = {};
      
      orders.forEach((order: any) => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { period: monthKey, revenue: 0, orders: 0 };
        }
        monthlyData[monthKey].revenue += order.total || 0;
        monthlyData[monthKey].orders += 1;
      });
      
      const result = Object.values(monthlyData).slice(-6); // Last 6 months
      return result.length > 0 ? result : [{ period: 'No Data', revenue: 0, orders: 0 }];
    },
    refetchInterval: 60000,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Unable to load chart data
      </div>
    );
  }

  const chartData = {
    labels: salesData?.length > 0 ? salesData.map((item: SalesData) => {
      if (item.period === 'No Data') return item.period;
      if (item.period.includes('-')) {
        // Handle YYYY-MM format
        const [year, month] = item.period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        // Handle other date formats
        const date = new Date(item.period);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
    }) : ['No Data'],
    datasets: [
      {
        label: 'Revenue (KSh)',
        data: salesData?.length > 0 ? salesData.map((item: SalesData) => Number(item.revenue) || 0) : [0],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return 'KSh ' + Number(value).toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export function SimplePieChart() {
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ['popularCategories'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      const dashboardResponse = await axios.get(`${apiUrl}/api/admin/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      // Generate category data from orders only
      const orders = dashboardResponse.data.recentOrders || [];
      const categoryStats: any = {};
      
      orders.forEach((order: any) => {
        order.orderItems?.forEach((item: any) => {
          const category = item.product?.category?.name || item.product?.name || 'Uncategorized';
          if (!categoryStats[category]) {
            categoryStats[category] = { category, sales: 0 };
          }
          categoryStats[category].sales += item.quantity || 1;
        });
      });
      
      const result = Object.values(categoryStats).slice(0, 8); // Top 8 categories
      return result.length > 0 ? result : [{ category: 'No Data', sales: 1 }];
    },
    refetchInterval: 60000,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Unable to load chart data
      </div>
    );
  }

  const chartData = {
    labels: categoryData?.length > 0 ? categoryData.map((item: CategoryData) => item.category) : ['No Data'],
    datasets: [
      {
        data: categoryData?.length > 0 ? categoryData.map((item: CategoryData) => Number(item.sales) || 0) : [1],
        backgroundColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
          '#FFEAA7',
          '#FF8A80',
          '#82B1FF',
          '#B39DDB',
          '#A5D6A7',
          '#FFCC02'
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}

export function SimpleBarChart() {
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['monthlySales'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      const response = await axios.get(
        `${apiUrl}/api/admin/dashboard`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Generate monthly orders data
      const orders = response.data.recentOrders || [];
      const monthlyData: any = {};
      
      orders.forEach((order: any) => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { period: monthKey, revenue: 0, orders: 0 };
        }
        monthlyData[monthKey].revenue += order.total || 0;
        monthlyData[monthKey].orders += 1;
      });
      
      const result = Object.values(monthlyData).slice(-6); // Last 6 months
      return result.length > 0 ? result : [{ period: 'No Data', revenue: 0, orders: 0 }];
    },
    refetchInterval: 60000,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Unable to load chart data
      </div>
    );
  }

  const chartData = {
    labels: salesData?.length > 0 ? salesData.map((item: SalesData) => {
      if (item.period === 'No Data') return item.period;
      if (item.period.includes('-')) {
        // Handle YYYY-MM format
        const [year, month] = item.period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        // Handle other date formats
        const date = new Date(item.period);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
    }) : ['No Data'],
    datasets: [
      {
        label: 'Orders',
        data: salesData?.length > 0 ? salesData.map((item: SalesData) => Number(item.orders) || 0) : [0],
        backgroundColor: '#10B981',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(16, 185, 129, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

export function CustomerGrowthChart({ customerGrowth }: { customerGrowth: Array<{ month: string; customers: number }> }) {
  const { data: growthData, isLoading, error } = useQuery({
    queryKey: ['customerGrowth'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
      const response = await axios.get(
        `${apiUrl}/api/admin/dashboard`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Generate customer growth data from orders
      const orders = response.data.recentOrders || [];
      const monthlyCustomers: any = {};
      
      orders.forEach((order: any) => {
        const date = new Date(order.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyCustomers[monthKey]) {
          monthlyCustomers[monthKey] = { month: monthKey, customers: new Set() };
        }
        if (order.user?.id) {
          monthlyCustomers[monthKey].customers.add(order.user.id);
        }
      });
      
      const result = Object.values(monthlyCustomers).map((item: any) => ({
        month: item.month,
        customers: item.customers.size
      })).slice(-6); // Last 6 months
      
      return result.length > 0 ? result : [{ month: 'No Data', customers: 0 }];
    },
    refetchInterval: 60000,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Unable to load chart data
      </div>
    );
  }

  const dataToUse = growthData?.length > 0 ? growthData : (customerGrowth?.length > 0 ? customerGrowth : []);
  
  const chartData = {
    labels: dataToUse.length > 0 ? dataToUse.map(item => item.month) : ['No Data'],
    datasets: [
      {
        label: 'New Customers',
        data: dataToUse.length > 0 ? dataToUse.map(item => item.customers) : [0],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(168, 85, 247, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
