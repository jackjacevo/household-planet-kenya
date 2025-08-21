'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesChartProps {
  data: Array<{
    period: string;
    orders: number;
    revenue: number;
    avgOrderValue: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = {
    labels: data.map(item => item.period),
    datasets: [
      {
        label: 'Revenue (KSh)',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: data.map(item => item.orders),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Period'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue (KSh)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

interface CategoryChartProps {
  data: Array<{
    category: string;
    sales: number;
  }>;
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Sales',
        data: data.map(item => item.sales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Popular Categories',
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}

interface GeographicChartProps {
  data: Array<{
    county: string;
    revenue: number;
    orders: number;
  }>;
}

export function GeographicChart({ data }: GeographicChartProps) {
  const chartData = {
    labels: data.slice(0, 10).map(item => item.county),
    datasets: [
      {
        label: 'Revenue (KSh)',
        data: data.slice(0, 10).map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales by County',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (KSh)'
        }
      }
    },
  };

  return <Bar data={chartData} options={options} />;
}

interface ConversionFunnelProps {
  data: {
    visitorToCustomer: number;
    visitorToOrder: number;
    customerToOrder: number;
  };
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const chartData = {
    labels: ['Visitor to Customer', 'Visitor to Order', 'Customer to Order'],
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: [data.visitorToCustomer, data.visitorToOrder, data.customerToOrder],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Conversion Rates',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      }
    },
  };

  return <Bar data={chartData} options={options} />;
}