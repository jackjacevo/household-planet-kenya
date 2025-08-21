import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

describe('Database Tests', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    prisma = new PrismaClient()
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Data Integrity', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User'
      }

      await prisma.user.create({ data: userData })
      
      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow()
    })

    it('should cascade delete orders when user is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'cascade@test.com',
          password: 'hashed',
          name: 'Test User'
        }
      })

      await prisma.order.create({
        data: {
          orderNumber: 'ORD-001',
          subtotal: 90,
          shippingCost: 10,
          total: 100,
          status: 'PENDING',
          shippingAddress: JSON.stringify({ street: 'Test St', city: 'Test City' }),
          paymentMethod: 'CASH_ON_DELIVERY',
          user: { connect: { id: user.id } }
        }
      })

      await prisma.user.delete({ where: { id: user.id } })
      
      const orders = await prisma.order.findMany({
        where: { userId: user.id }
      })
      
      expect(orders).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    it('should query products efficiently', async () => {
      const start = Date.now()
      
      await prisma.product.findMany({
        include: {
          category: true,
          reviews: true
        },
        take: 20
      })
      
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // Under 100ms
    })
  })
})