const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

async function scrapeChiefAI() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the login page
    await page.goto('https://www.chiefaioffice.xyz/login');

    // Fill in the login form
    await page.type('input[type="email"]', process.env.EMAIL);
    await page.type('input[type="password"]', process.env.PASSWORD);

    // Click the login button and wait for navigation
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    // Navigate to the specific page we want to scrape
    await page.goto('https://www.chiefaioffice.xyz/p/8-ai-startups-raise-180m', { waitUntil: 'networkidle0' });

    // Extract the content
    const content = await page.evaluate(() => {
      const title = document.querySelector('h1').innerText;
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
      const startups = Array.from(document.querySelectorAll('h5')).map(h5 => h5.innerText);

      return {
        title,
        paragraphs,
        startups,
      };
    });

    console.log(content);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
}

scrapeChiefAI();