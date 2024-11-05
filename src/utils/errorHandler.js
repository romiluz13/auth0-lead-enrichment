export class ErrorHandler {
  static handle(error, context) {
    const errorTypes = {
      RESEARCH_ERROR: 'ResearchError',
      ANALYSIS_ERROR: 'AnalysisError',
      OUTREACH_ERROR: 'OutreachError',
      VALIDATION_ERROR: 'ValidationError',
      API_ERROR: 'APIError',
      RATE_LIMIT_ERROR: 'RateLimitError'
    };

    const errorWithContext = {
      type: error.name || 'UnknownError',
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      stackTrace: error.stack
    };

    console.error('Error occurred:', errorWithContext);
    
    // Implement retry logic for specific error types
    if (error.name === errorTypes.RATE_LIMIT_ERROR) {
      return this.handleRateLimit(error, context);
    }
    
    if (error.name === errorTypes.API_ERROR) {
      return this.handleAPIError(error, context);
    }

    throw errorWithContext;
  }

  static handleRateLimit(error, context) {
    const backoffTime = this.calculateBackoff(context.retryCount || 0);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          shouldRetry: true,
          backoffTime,
          retryCount: (context.retryCount || 0) + 1
        });
      }, backoffTime);
    });
  }

  static handleAPIError(error, context) {
    if (error.status === 429) {
      return this.handleRateLimit(error, context);
    }
    
    // Handle other API errors based on status codes
    const retriableStatusCodes = [500, 502, 503, 504];
    if (retriableStatusCodes.includes(error.status)) {
      return this.handleRateLimit(error, context);
    }

    throw error;
  }

  static calculateBackoff(retryCount) {
    // Exponential backoff with jitter
    const base = 1000; // 1 second
    const maxBackoff = 60000; // 1 minute
    const exponential = Math.min(maxBackoff, base * Math.pow(2, retryCount));
    const jitter = Math.random() * exponential * 0.1;
    return exponential + jitter;
  }

  static validateLinkedInData(data) {
    const requiredFields = {
      company: ['name', 'website', 'industry', 'size'],
      contactPerson: ['name', 'title', 'email']
    };

    const errors = [];

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    // Validate company fields
    requiredFields.company.forEach(field => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate contact person fields
    if (!data.contactPerson || typeof data.contactPerson !== 'object') {
      errors.push('Missing or invalid contactPerson object');
    } else {
      requiredFields.contactPerson.forEach(field => {
        if (!data.contactPerson[field]) {
          errors.push(`Missing required contactPerson field: ${field}`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}
