export class RateLimiter {
    constructor(requestsPerSecond = 1) {
        this.requestsPerSecond = requestsPerSecond;
        this.queue = [];
        this.lastRequestTime = 0;
    }

    async limit() {
        const now = Date.now();
        const timeToWait = Math.max(0, (1000 / this.requestsPerSecond) - (now - this.lastRequestTime));
        
        if (timeToWait > 0) {
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
        
        this.lastRequestTime = Date.now();
    }
} 