// Customer Feedback Collection System
const axios = require('axios');

class FeedbackCollector {
  constructor() {
    this.feedbackChannels = {
      website: 'Website Reviews',
      email: 'Email Surveys',
      whatsapp: 'WhatsApp Feedback',
      social: 'Social Media',
      support: 'Support Tickets'
    };
    
    this.sentimentThresholds = {
      positive: 0.6,
      negative: -0.3
    };
  }

  async collectWebsiteFeedback() {
    try {
      const response = await axios.get('https://householdplanetkenya.co.ke/api/feedback/website');
      return response.data.feedback || [];
    } catch (error) {
      console.error('Failed to collect website feedback:', error);
      return [];
    }
  }

  async collectEmailSurveys() {
    try {
      const response = await axios.get('https://householdplanetkenya.co.ke/api/feedback/surveys');
      return response.data.surveys || [];
    } catch (error) {
      console.error('Failed to collect email surveys:', error);
      return [];
    }
  }

  async collectSocialMediaMentions() {
    try {
      // Collect mentions from social media APIs
      const mentions = [];
      
      // Facebook mentions (if API available)
      // Twitter mentions (if API available)
      // Instagram mentions (if API available)
      
      return mentions;
    } catch (error) {
      console.error('Failed to collect social media mentions:', error);
      return [];
    }
  }

  async collectSupportTickets() {
    try {
      const response = await axios.get('https://householdplanetkenya.co.ke/api/support/tickets/feedback');
      return response.data.tickets || [];
    } catch (error) {
      console.error('Failed to collect support tickets:', error);
      return [];
    }
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis (in production, use proper NLP service)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'fast', 'quality'];
    const negativeWords = ['bad', 'terrible', 'slow', 'poor', 'hate', 'awful', 'broken', 'delayed'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return score / words.length;
  }

  categorizeIssues(feedback) {
    const categories = {
      delivery: [],
      payment: [],
      product_quality: [],
      customer_service: [],
      website: [],
      pricing: [],
      other: []
    };

    feedback.forEach(item => {
      const text = item.message.toLowerCase();
      
      if (text.includes('delivery') || text.includes('shipping')) {
        categories.delivery.push(item);
      } else if (text.includes('payment') || text.includes('mpesa')) {
        categories.payment.push(item);
      } else if (text.includes('quality') || text.includes('product')) {
        categories.product_quality.push(item);
      } else if (text.includes('support') || text.includes('service')) {
        categories.customer_service.push(item);
      } else if (text.includes('website') || text.includes('app')) {
        categories.website.push(item);
      } else if (text.includes('price') || text.includes('cost')) {
        categories.pricing.push(item);
      } else {
        categories.other.push(item);
      }
    });

    return categories;
  }

  async processFeedback() {
    console.log('📝 Collecting customer feedback...');
    
    const allFeedback = [
      ...(await this.collectWebsiteFeedback()),
      ...(await this.collectEmailSurveys()),
      ...(await this.collectSocialMediaMentions()),
      ...(await this.collectSupportTickets())
    ];

    if (allFeedback.length === 0) {
      console.log('No new feedback to process');
      return;
    }

    // Analyze sentiment
    const sentimentAnalysis = allFeedback.map(feedback => ({
      ...feedback,
      sentiment: this.analyzeSentiment(feedback.message),
      sentimentLabel: this.getSentimentLabel(this.analyzeSentiment(feedback.message))
    }));

    // Categorize issues
    const categorizedFeedback = this.categorizeIssues(sentimentAnalysis);

    // Generate insights
    const insights = this.generateInsights(sentimentAnalysis, categorizedFeedback);

    // Send alerts for negative feedback
    await this.handleNegativeFeedback(sentimentAnalysis.filter(f => f.sentiment < this.sentimentThresholds.negative));

    // Generate daily report
    await this.generateFeedbackReport(insights);

    console.log(`✅ Processed ${allFeedback.length} feedback items`);
  }

  getSentimentLabel(score) {
    if (score >= this.sentimentThresholds.positive) return 'positive';
    if (score <= this.sentimentThresholds.negative) return 'negative';
    return 'neutral';
  }

  generateInsights(feedback, categorized) {
    const totalFeedback = feedback.length;
    const sentimentDistribution = {
      positive: feedback.filter(f => f.sentimentLabel === 'positive').length,
      neutral: feedback.filter(f => f.sentimentLabel === 'neutral').length,
      negative: feedback.filter(f => f.sentimentLabel === 'negative').length
    };

    const topIssues = Object.entries(categorized)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalFeedback,
      sentimentDistribution,
      topIssues,
      averageSentiment: feedback.reduce((sum, f) => sum + f.sentiment, 0) / totalFeedback
    };
  }

  async handleNegativeFeedback(negativeFeedback) {
    if (negativeFeedback.length === 0) return;

    console.log(`⚠️ Found ${negativeFeedback.length} negative feedback items`);

    // Send alert to customer service team
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 ${negativeFeedback.length} negative feedback items require attention`,
        channel: '#customer-service',
        attachments: negativeFeedback.slice(0, 3).map(feedback => ({
          color: 'danger',
          fields: [
            { title: 'Customer', value: feedback.customerName || 'Anonymous', short: true },
            { title: 'Channel', value: feedback.channel, short: true },
            { title: 'Message', value: feedback.message.substring(0, 200), short: false }
          ]
        }))
      });
    } catch (error) {
      console.error('Failed to send negative feedback alert:', error);
    }

    // Create support tickets for urgent issues
    for (const feedback of negativeFeedback.slice(0, 5)) {
      try {
        await axios.post('https://householdplanetkenya.co.ke/api/support/tickets', {
          subject: `Negative Feedback Follow-up: ${feedback.channel}`,
          description: feedback.message,
          priority: 'high',
          customerEmail: feedback.customerEmail,
          source: 'feedback_system'
        });
      } catch (error) {
        console.error('Failed to create support ticket:', error);
      }
    }
  }

  async generateFeedbackReport(insights) {
    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalFeedback: insights.totalFeedback,
        averageSentiment: Math.round(insights.averageSentiment * 100) / 100,
        sentimentDistribution: insights.sentimentDistribution
      },
      topIssues: insights.topIssues,
      recommendations: this.generateRecommendations(insights)
    };

    // Save report
    try {
      await axios.post('https://householdplanetkenya.co.ke/api/admin/reports/feedback', report);
    } catch (error) {
      console.error('Failed to save feedback report:', error);
    }

    // Send daily summary to management
    try {
      await axios.post('https://householdplanetkenya.co.ke/api/notifications/email', {
        to: 'management@householdplanetkenya.co.ke',
        subject: `Daily Feedback Report - ${report.date}`,
        body: `
Daily Feedback Summary:
- Total Feedback: ${insights.totalFeedback}
- Average Sentiment: ${Math.round(insights.averageSentiment * 100) / 100}
- Positive: ${insights.sentimentDistribution.positive}
- Neutral: ${insights.sentimentDistribution.neutral}
- Negative: ${insights.sentimentDistribution.negative}

Top Issues:
${insights.topIssues.map(issue => `- ${issue.category}: ${issue.count} mentions`).join('\n')}

Recommendations:
${report.recommendations.join('\n- ')}
        `
      });
    } catch (error) {
      console.error('Failed to send feedback report:', error);
    }
  }

  generateRecommendations(insights) {
    const recommendations = [];
    
    if (insights.sentimentDistribution.negative > insights.totalFeedback * 0.2) {
      recommendations.push('High negative feedback rate - investigate common issues');
    }
    
    insights.topIssues.forEach(issue => {
      if (issue.count > insights.totalFeedback * 0.3) {
        recommendations.push(`Focus on improving ${issue.category} - high mention rate`);
      }
    });
    
    if (insights.averageSentiment < 0) {
      recommendations.push('Overall sentiment is negative - urgent action required');
    }
    
    return recommendations.length > 0 ? recommendations : ['Continue current practices - feedback is positive'];
  }

  startFeedbackCollection() {
    console.log('📊 Starting customer feedback collection...');
    
    // Process feedback every hour
    setInterval(() => {
      this.processFeedback();
    }, 3600000);

    // Generate weekly summary every Sunday
    setInterval(() => {
      if (new Date().getDay() === 0) { // Sunday
        this.generateWeeklySummary();
      }
    }, 86400000); // Daily check
  }

  async generateWeeklySummary() {
    // Implementation for weekly feedback summary
    console.log('📈 Generating weekly feedback summary...');
  }
}

// Start feedback collection
const feedbackCollector = new FeedbackCollector();
feedbackCollector.startFeedbackCollection();

module.exports = FeedbackCollector;