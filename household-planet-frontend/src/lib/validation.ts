import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format');

export const dashboardStatsSchema = z.object({
  overview: z.object({
    totalOrders: z.number().min(0),
    totalRevenue: z.number().min(0),
    totalCustomers: z.number().min(0),
    totalProducts: z.number().min(0),
    activeProducts: z.number().min(0),
    outOfStockProducts: z.number().min(0),
    todayOrders: z.number().min(0),
    todayRevenue: z.number().min(0),
    pendingOrders: z.number().min(0),
    lowStockProducts: z.number().min(0),
    revenueChange: z.string().optional(),
    revenueChangeType: z.enum(['increase', 'decrease', 'neutral']).optional(),
    ordersChange: z.string().optional(),
    ordersChangeType: z.enum(['increase', 'decrease', 'neutral']).optional(),
    customersChange: z.string().optional(),
    customersChangeType: z.enum(['increase', 'decrease', 'neutral']).optional(),
    productsChange: z.string().optional(),
    productsChangeType: z.enum(['increase', 'decrease', 'neutral']).optional()
  }),
  recentOrders: z.array(z.object({
    id: z.number(),
    orderNumber: z.string(),
    total: z.number().min(0),
    status: z.string(),
    createdAt: z.string(),
    user: z.object({
      name: z.string(),
      email: z.string().email()
    }).optional()
  })).optional(),
  topProducts: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number().min(0),
    totalSold: z.number().min(0)
  })).optional(),
  customerGrowth: z.array(z.object({
    month: z.string(),
    customers: z.number().min(0)
  })).optional(),
  salesByCounty: z.array(z.object({
    county: z.string(),
    revenue: z.number().min(0),
    orders: z.number().min(0)
  })).optional()
});

export function validateApiResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('API response validation failed:', error);
    throw new Error('Invalid data format received from server');
  }
}