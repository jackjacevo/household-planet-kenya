import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(eventData: {
    event: string
    properties: Record<string, any>
    userId?: string
    sessionId: string
  }) {
    return this.prisma.analyticsEvent.create({
      data: {
        event: eventData.event,
        properties: JSON.stringify(eventData.properties),
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        timestamp: new Date()
      }
    })
  }

  async getDashboardData(period: string) {
    const days = this.parsePeriod(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [pageViews, conversions, totalUsers, avgSessionDuration] = await Promise.all([
      this.getPageViews(startDate),
      this.getConversions(startDate),
      this.getTotalUsers(startDate),
      this.getAvgSessionDuration(startDate)
    ])

    return {
      pageViews,
      conversions,
      totalUsers,
      avgSessionDuration,
      period
    }
  }

  async getConversionFunnel(period: string) {
    const days = this.parsePeriod(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const funnelSteps = [
      'homepage',
      'product_discovery',
      'product_view',
      'add_to_cart',
      'checkout_start',
      'purchase_complete'
    ]

    const funnelData = await Promise.all(
      funnelSteps.map(async (step) => {
        const count = await this.prisma.analyticsEvent.count({
          where: {
            event: 'customer_journey_stage',
            properties: {
              contains: step
            },
            timestamp: {
              gte: startDate
            }
          }
        })
        return { stage: step, users: count }
      })
    )

    return funnelData
  }

  async getTopProducts(period: string) {
    const days = this.parsePeriod(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const productViews = await this.prisma.analyticsEvent.groupBy({
      by: ['properties'],
      where: {
        event: 'view_item',
        timestamp: {
          gte: startDate
        }
      },
      _count: true
    })

    return productViews.map(item => ({
      productId: item.properties['item_id'],
      productName: item.properties['item_name'],
      views: item._count,
      category: item.properties['category']
    }))
  }

  async getUserJourney(period: string) {
    const days = this.parsePeriod(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const journeyEvents = await this.prisma.analyticsEvent.findMany({
      where: {
        event: 'customer_journey_stage',
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Group by session and analyze journey paths
    const sessionJourneys = new Map()
    
    journeyEvents.forEach(event => {
      const sessionId = event.sessionId
      if (!sessionJourneys.has(sessionId)) {
        sessionJourneys.set(sessionId, [])
      }
      sessionJourneys.get(sessionId).push(event.properties['stage'])
    })

    return Array.from(sessionJourneys.values())
  }

  private async getPageViews(startDate: Date) {
    return this.prisma.analyticsEvent.groupBy({
      by: ['properties'],
      where: {
        event: 'page_view',
        timestamp: {
          gte: startDate
        }
      },
      _count: true
    })
  }

  private async getConversions(startDate: Date) {
    const conversionEvents = ['purchase', 'add_to_cart', 'newsletter_signup', 'whatsapp_click']
    
    return Promise.all(
      conversionEvents.map(async (event) => {
        const count = await this.prisma.analyticsEvent.count({
          where: {
            event,
            timestamp: {
              gte: startDate
            }
          }
        })
        return { event, count }
      })
    )
  }

  private async getTotalUsers(startDate: Date) {
    const uniqueUsers = await this.prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: startDate
        }
      }
    })
    
    return uniqueUsers.length
  }

  private async getAvgSessionDuration(startDate: Date) {
    // This would require more complex session tracking
    // For now, return a mock value
    return 204 // 3 minutes 24 seconds
  }

  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)([dwmy])/)
    if (!match) return 30

    const [, num, unit] = match
    const value = parseInt(num)

    switch (unit) {
      case 'd': return value
      case 'w': return value * 7
      case 'm': return value * 30
      case 'y': return value * 365
      default: return 30
    }
  }
}
