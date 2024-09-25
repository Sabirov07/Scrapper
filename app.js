const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

async function scrapeChiefAI() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('https://www.chiefaioffice.xyz/login');

    console.log('Filling in login form...');
    await page.type('input[type="email"]', process.env.EMAIL);
    await page.type('input[type="password"]', process.env.PASSWORD);

    console.log('Submitting login form...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    console.log('Navigating to target page...');
    await page.goto('https://www.chiefaioffice.xyz/p/8-ai-startups-raise-180m', { waitUntil: 'networkidle0' });

    console.log('Extracting startup information...');
    const startups = await page.evaluate(() => {
      console.log('Inside page.evaluate...');
      const allElements = document.body.innerText;
      console.log('All text content:', allElements);

      const startupElements = Array.from(document.querySelectorAll('h5, p'));
      console.log('Number of h5 and p elements:', startupElements.length);

      const startups = [];
      let currentStartup = null;

      startupElements.forEach((element) => {
        const text = element.innerText.trim();
        console.log('Element text:', text);

        if (text.startsWith('→')) {
          if (currentStartup) {
            startups.push(currentStartup);
          }
          currentStartup = { name: text };
        } else if (currentStartup) {
          currentStartup.details = (currentStartup.details || '') + text + '\n';
        }
      });

      if (currentStartup) {
        startups.push(currentStartup);
      }

      console.log('Number of startups found:', startups.length);
      return startups;
    });

    console.log('Startups extracted:', startups);

    if (startups.length === 0) {
      console.log('No startups found. Logging entire page content:');
      const pageContent = await page.content();
      console.log(pageContent);
    } else {
      startups.forEach((startup, index) => {
        console.log(`Startup ${index + 1}:`);
        console.log(startup.name);
        console.log(startup.details);
        console.log('-------------------');
      });
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
}

scrapeChiefAI();