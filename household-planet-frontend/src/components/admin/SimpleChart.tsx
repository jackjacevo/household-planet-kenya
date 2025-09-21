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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/sales?period=monthly`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return (response as any).data;
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
    }) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (KSh)',
        data: salesData?.length > 0 ? salesData.map((item: SalesData) => Number(item.revenue) || 0) : [125000, 145000, 135000, 175000, 165000, 195000],
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/popular?period=monthly`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return (response as any).data;
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
    labels: categoryData?.length > 0 ? categoryData.map((item: CategoryData) => item.category) : ['Kitchen & Dining', 'Home Decor', 'Cleaning', 'Storage', 'Bathroom'],
    datasets: [
      {
        data: categoryData?.length > 0 ? categoryData.map((item: CategoryData) => Number(item.sales) || 0) : [35, 25, 20, 12, 8],
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/sales?period=monthly`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return (response as any).data;
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
    }) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders',
        data: salesData?.length > 0 ? salesData.map((item: SalesData) => Number(item.orders) || 0) : [45, 52, 48, 61, 55, 67],
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
  const fallbackData = [
    { month: 'Jan', customers: 12 },
    { month: 'Feb', customers: 18 },
    { month: 'Mar', customers: 25 },
    { month: 'Apr', customers: 32 },
    { month: 'May', customers: 28 },
    { month: 'Jun', customers: 35 }
  ];
  
  const dataToUse = customerGrowth?.length > 0 ? customerGrowth : fallbackData;
  
  const chartData = {
    labels: dataToUse.map(item => item.month),
    datasets: [
      {
        label: 'New Customers',
        data: dataToUse.map(item => item.customers),
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
