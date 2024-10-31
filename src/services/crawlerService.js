import puppeteer from 'puppeteer';

export class CrawlerService {
  constructor() {
    this.browser = null;
  }

  async crawlCompany(companyName) {
    try {
      // Launch browser with additional options for stability
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ],
        ignoreHTTPSErrors: true,
        timeout: 60000
      });

      const results = await Promise.allSettled([
        this.crawlCompanyWebsite(companyName),
        this.crawlNewsArticles(companyName),
        this.crawlTechStack(companyName)
      ]);

      return {
        websiteData: results[0].status === 'fulfilled' ? results[0].value : null,
        newsData: results[1].status === 'fulfilled' ? results[1].value : [],
        techData: results[2].status === 'fulfilled' ? results[2].value : []
      };

    } catch (error) {
      console.error('Crawler Error:', error.message);
      return {
        websiteData: null,
        newsData: [],
        techData: []
      };
    } finally {
      if (this.browser) {
        await this.browser.close().catch(console.error);
      }
    }
  }

  async crawlCompanyWebsite(companyName) {
    const url = `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    let page = null;
    
    try {
      page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(30000);
      await page.setViewport({ width: 1280, height: 800 });
      
      // Add error handling for navigation
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      if (!response.ok()) {
        throw new Error(`Failed to load ${url}: ${response.status()}`);
      }

      const content = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        mainContent: document.querySelector('main')?.innerText || document.body.innerText
      }));

      return content;
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error.message);
      return null;
    } finally {
      if (page) {
        await page.close().catch(console.error);
      }
    }
  }

  async crawlNewsArticles(companyName) {
    const newsUrls = [
      `https://www.calcalist.co.il/search?q=${encodeURIComponent(companyName)}`,
      `https://www.globes.co.il/search?q=${encodeURIComponent(companyName)}`,
      `https://nocamels.com/?s=${encodeURIComponent(companyName)}`
    ];

    const articles = [];

    for (const url of newsUrls) {
      try {
        // Create a new page for each news source
        const page = await this.browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the news site
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });

        // Wait for article elements to load
        await page.waitForSelector('article', { timeout: 5000 });

        // Extract articles data
        const pageArticles = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('article')).map(article => ({
            title: article.querySelector('h2')?.innerText || '',
            summary: article.querySelector('p')?.innerText || '',
            date: article.querySelector('time')?.getAttribute('datetime') || '',
            url: article.querySelector('a')?.href || ''
          }));
        });

        articles.push(...pageArticles);
        await page.close();

      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
        continue;
      }
    }

    return articles;
  }

  async crawlTechStack(companyName) {
    const stackShareUrl = `https://stackshare.io/${companyName.toLowerCase()}`;
    
    try {
      // Create a new page
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Navigate to StackShare
      await page.goto(stackShareUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for tech stack elements
      await page.waitForSelector('.technology-item', { timeout: 5000 });

      // Extract tech stack data
      const techStack = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.technology-item')).map(tech => ({
          name: tech.querySelector('.name')?.innerText || '',
          category: tech.querySelector('.category')?.innerText || '',
          description: tech.querySelector('.description')?.innerText || ''
        }));
      });

      await page.close();
      return techStack;

    } catch (error) {
      console.error(`Failed to crawl ${stackShareUrl}:`, error);
      return [];
    }
  }

  getChromePath() {
    switch (process.platform) {
      case 'win32':
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      case 'darwin':
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      case 'linux':
        return '/usr/bin/google-chrome';
      default:
        throw new Error('Unsupported platform');
    }
  }
} 