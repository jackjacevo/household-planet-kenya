// Error Tracking and Alerting System
const Sentry = require('@sentry/node');
const axios = require('axios');

class ErrorTracker {
  constructor() {
    this.errorCounts = new Map();
    this.errorThresholds = {
      '4xx': 50, // per hour
      '5xx': 10, // per hour
      'payment_failures': 5, // per hour
      'database_errors': 3 // per hour
    };
    
    this.initializeSentry();
  }

  initializeSentry() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      beforeSend(event) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.authorization;
          }
        }
        return event;
      }
    });
  }

  async collectErrors() {
    try {
      // Get application errors from logs
      const appErrors = await this.getApplicationErrors();
      
      // Get API errors
      const apiErrors = await this.getAPIErrors();
      
      // Get payment errors
      const paymentErrors = await this.getPaymentErrors();
      
      // Get database errors
      const dbErrors = await this.getDatabaseErrors();
      
      this.processErrors([...appErrors, ...apiErrors, ...paymentErrors, ...dbErrors]);
      
    } catch (error) {
      console.error('Error collecting error data:', error);
      Sentry.captureException(error);
    }
  }

  async getApplicationErrors() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/logs/errors', {
        params: { since: new Date(Date.now() - 3600000).toISOString() }
      });
      return response.data.errors || [];
    } catch (error) {
      return [];
    }
  }

  async getAPIErrors() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/metrics/errors');
      return response.data.errors || [];
    } catch (error) {
      return [];
    }
  }

  async getPaymentErrors() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/payments/errors');
      return response.data.errors || [];
    } catch (error) {
      return [];
    }
  }

  async getDatabaseErrors() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/db-errors');
      return response.data.errors || [];
    } catch (error) {
      return [];
    }
  }

  processErrors(errors) {
    const errorsByType = this.categorizeErrors(errors);
    
    Object.entries(errorsByType).forEach(([type, errorList]) => {
      const count = errorList.length;
      this.errorCounts.set(type, count);
      
      if (count > (this.errorThresholds[type] || 0)) {
        this.sendErrorAlert(type, count, errorList);
      }
    });
    
    this.logErrorSummary(errorsByType);
  }

  categorizeErrors(errors) {
    const categories = {
      '4xx': [],
      '5xx': [],
      'payment_failures': [],
      'database_errors': [],
      'validation_errors': [],
      'authentication_errors': []
    };

    errors.forEach(error => {
      if (error.statusCode >= 400 && error.statusCode < 500) {
        categories['4xx'].push(error);
      } else if (error.statusCode >= 500) {
        categories['5xx'].push(error);
      } else if (error.type === 'payment') {
        categories['payment_failures'].push(error);
      } else if (error.type === 'database') {
        categories['database_errors'].push(error);
      } else if (error.type === 'validation') {
        categories['validation_errors'].push(error);
      } else if (error.type === 'auth') {
        categories['authentication_errors'].push(error);
      }
    });

    return categories;
  }

  async sendErrorAlert(type, count, errors) {
    const alert = {
      type: 'ERROR_THRESHOLD_EXCEEDED',
      category: type,
      count,
      threshold: this.errorThresholds[type],
      timestamp: new Date(),
      samples: errors.slice(0, 3) // Include first 3 errors as samples
    };

    // Send to Sentry
    Sentry.captureMessage(`Error threshold exceeded: ${type} (${count} errors)`, 'warning');

    // Send Slack notification
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 Error Alert: ${count} ${type} errors in the last hour (threshold: ${this.errorThresholds[type]})`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Error Type', value: type, short: true },
            { title: 'Count', value: count.toString(), short: true },
            { title: 'Sample Errors', value: errors.slice(0, 2).map(e => e.message).join('\n'), short: false }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }

    // Send email for critical errors
    if (type === '5xx' || type === 'database_errors') {
      try {
        await axios.post('https://api.householdplanet.co.ke/api/notifications/email', {
          to: 'admin@householdplanet.co.ke',
          subject: `CRITICAL: ${count} ${type} errors detected`,
          body: `Error threshold exceeded for ${type}.\n\nCount: ${count}\nThreshold: ${this.errorThresholds[type]}\n\nSample errors:\n${errors.slice(0, 3).map(e => `- ${e.message}`).join('\n')}`
        });
      } catch (error) {
        console.error('Failed to send email alert:', error);
      }
    }
  }

  logErrorSummary(errorsByType) {
    console.log('📊 Error Summary (Last Hour):');
    Object.entries(errorsByType).forEach(([type, errors]) => {
      if (errors.length > 0) {
        console.log(`   ${type}: ${errors.length} errors`);
      }
    });
  }

  startErrorTracking() {
    console.log('🔍 Starting error tracking...');
    
    // Collect errors every 5 minutes
    setInterval(() => {
      this.collectErrors();
    }, 300000);

    // Reset hourly counters
    setInterval(() => {
      this.errorCounts.clear();
    }, 3600000);
  }

  // Custom error reporting method
  reportError(error, context = {}) {
    Sentry.withScope(scope => {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
      Sentry.captureException(error);
    });
  }
}

// Start error tracking
const errorTracker = new ErrorTracker();
errorTracker.startErrorTracking();

module.exports = ErrorTracker;