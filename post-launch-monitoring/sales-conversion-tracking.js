// Sales and Conversion Tracking System
const axios = require('axios');

class SalesTracker {
  constructor() {
    this.metrics = {
      dailySales: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      customerAcquisitionCost: 0,
      customerLifetimeValue: 0
    };
    
    this.targets = {
      dailySales: 50000, // KES 50,000
      conversionRate: 3.5, // 3.5%
      averageOrderValue: 2500, // KES 2,500
      customerRetention: 80 // 80%
    };
  }

  async collectSalesData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`https://api.householdplanet.co.ke/api/admin/analytics/sales`, {
        params: { date: today }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to collect sales data:', error);
      return null;
    }
  }

  async collectTrafficData() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/analytics/traffic');
      return response.data;
    } catch (error) {
      console.error('Failed to collect traffic data:', error);
      return null;
    }
  }

  async collectConversionData() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/analytics/conversions');
      return response.data;
    } catch (error) {
      console.error('Failed to collect conversion data:', error);
      return null;
    }
  }

  calculateConversionRate(visitors, orders) {
    return visitors > 0 ? (orders / visitors) * 100 : 0;
  }

  calculateAverageOrderValue(totalRevenue, totalOrders) {
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  }

  async analyzeCustomerBehavior() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/analytics/customer-behavior');
      const data = response.data;
      
      return {
        bounceRate: data.bounceRate,
        averageSessionDuration: data.averageSessionDuration,
        pagesPerSession: data.pagesPerSession,
        cartAbandonmentRate: data.cartAbandonmentRate,
        returnCustomerRate: data.returnCustomerRate
      };
    } catch (error) {
      console.error('Failed to analyze customer behavior:', error);
      return null;
    }
  }

  async trackProductPerformance() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/analytics/products');
      const products = response.data.products;
      
      return {
        topSelling: products.sort((a, b) => b.sales - a.sales).slice(0, 10),
        lowPerforming: products.filter(p => p.views > 100 && p.conversionRate < 1),
        trending: products.filter(p => p.growthRate > 20)
      };
    } catch (error) {
      console.error('Failed to track product performance:', error);
      return null;
    }
  }

  async generateSalesReport() {
    console.log('📊 Generating sales and conversion report...');
    
    const salesData = await this.collectSalesData();
    const trafficData = await this.collectTrafficData();
    const conversionData = await this.collectConversionData();
    const customerBehavior = await this.analyzeCustomerBehavior();
    const productPerformance = await this.trackProductPerformance();
    
    if (!salesData || !trafficData) {
      console.log('❌ Failed to collect required data');
      return;
    }

    // Calculate key metrics
    this.metrics.dailySales = salesData.totalRevenue;
    this.metrics.conversionRate = this.calculateConversionRate(trafficData.visitors, salesData.orders);
    this.metrics.averageOrderValue = this.calculateAverageOrderValue(salesData.totalRevenue, salesData.orders);

    // Check against targets
    const performance = this.evaluatePerformance();
    
    // Generate insights
    const insights = this.generateInsights(salesData, trafficData, customerBehavior, productPerformance);
    
    // Send alerts if needed
    await this.sendPerformanceAlerts(performance);
    
    // Save report
    await this.saveReport({
      date: new Date().toISOString().split('T')[0],
      metrics: this.metrics,
      performance,
      insights,
      salesData,
      trafficData,
      customerBehavior,
      productPerformance
    });

    this.logMetrics();
  }

  evaluatePerformance() {
    return {
      salesTarget: {
        achieved: this.metrics.dailySales >= this.targets.dailySales,
        percentage: (this.metrics.dailySales / this.targets.dailySales) * 100
      },
      conversionTarget: {
        achieved: this.metrics.conversionRate >= this.targets.conversionRate,
        percentage: (this.metrics.conversionRate / this.targets.conversionRate) * 100
      },
      aovTarget: {
        achieved: this.metrics.averageOrderValue >= this.targets.averageOrderValue,
        percentage: (this.metrics.averageOrderValue / this.targets.averageOrderValue) * 100
      }
    };
  }

  generateInsights(salesData, trafficData, customerBehavior, productPerformance) {
    const insights = [];
    
    // Sales insights
    if (salesData.orders < 10) {
      insights.push('Low order volume - consider promotional campaigns');
    }
    
    if (this.metrics.conversionRate < 2) {
      insights.push('Low conversion rate - optimize checkout process');
    }
    
    if (customerBehavior && customerBehavior.cartAbandonmentRate > 70) {
      insights.push('High cart abandonment - review checkout UX');
    }
    
    if (customerBehavior && customerBehavior.bounceRate > 60) {
      insights.push('High bounce rate - improve landing page content');
    }
    
    // Product insights
    if (productPerformance && productPerformance.lowPerforming.length > 5) {
      insights.push(`${productPerformance.lowPerforming.length} products have low conversion rates`);
    }
    
    if (productPerformance && productPerformance.trending.length > 0) {
      insights.push(`${productPerformance.trending.length} products are trending - consider promoting`);
    }
    
    return insights;
  }

  async sendPerformanceAlerts(performance) {
    const alerts = [];
    
    if (performance.salesTarget.percentage < 50) {
      alerts.push({
        type: 'LOW_SALES',
        message: `Daily sales at ${Math.round(performance.salesTarget.percentage)}% of target`,
        severity: 'WARNING'
      });
    }
    
    if (performance.conversionTarget.percentage < 70) {
      alerts.push({
        type: 'LOW_CONVERSION',
        message: `Conversion rate at ${Math.round(performance.conversionTarget.percentage)}% of target`,
        severity: 'WARNING'
      });
    }
    
    for (const alert of alerts) {
      try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          text: `📉 Performance Alert: ${alert.message}`,
          channel: '#sales-alerts',
          attachments: [{
            color: alert.severity === 'CRITICAL' ? 'danger' : 'warning',
            fields: [
              { title: 'Alert Type', value: alert.type, short: true },
              { title: 'Current Performance', value: `${Math.round(performance.salesTarget.percentage)}%`, short: true }
            ]
          }]
        });
      } catch (error) {
        console.error('Failed to send performance alert:', error);
      }
    }
  }

  async saveReport(report) {
    try {
      await axios.post('https://api.householdplanet.co.ke/api/admin/reports/sales', report);
      console.log('✅ Sales report saved');
    } catch (error) {
      console.error('Failed to save sales report:', error);
    }
  }

  logMetrics() {
    console.log('📈 Daily Sales Metrics:');
    console.log(`   Revenue: KES ${this.metrics.dailySales.toLocaleString()}`);
    console.log(`   Conversion Rate: ${this.metrics.conversionRate.toFixed(2)}%`);
    console.log(`   Average Order Value: KES ${this.metrics.averageOrderValue.toLocaleString()}`);
  }

  async trackRealTimeMetrics() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/analytics/realtime');
      const data = response.data;
      
      console.log('🔴 Real-time Metrics:');
      console.log(`   Active Users: ${data.activeUsers}`);
      console.log(`   Orders (Last Hour): ${data.recentOrders}`);
      console.log(`   Revenue (Last Hour): KES ${data.recentRevenue.toLocaleString()}`);
      
      // Alert for unusual activity
      if (data.activeUsers > 500) {
        await this.sendTrafficSpike(data.activeUsers);
      }
      
    } catch (error) {
      console.error('Failed to track real-time metrics:', error);
    }
  }

  async sendTrafficSpike(activeUsers) {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚀 Traffic Spike Alert: ${activeUsers} active users online!`,
        channel: '#sales-alerts'
      });
    } catch (error) {
      console.error('Failed to send traffic spike alert:', error);
    }
  }

  startSalesTracking() {
    console.log('💰 Starting sales and conversion tracking...');
    
    // Generate daily report at 11 PM
    const scheduleDaily = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(23, 0, 0, 0);
      
      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeUntilReport = scheduledTime.getTime() - now.getTime();
      setTimeout(() => {
        this.generateSalesReport();
        setInterval(() => this.generateSalesReport(), 86400000); // Daily
      }, timeUntilReport);
    };
    
    scheduleDaily();
    
    // Track real-time metrics every 5 minutes
    setInterval(() => {
      this.trackRealTimeMetrics();
    }, 300000);
  }
}

// Start sales tracking
const salesTracker = new SalesTracker();
salesTracker.startSalesTracking();

module.exports = SalesTracker;