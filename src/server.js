const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

app.get('/googleSearch', async (req, res) => {
  if (!req.query.query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(req.query.query)}`);
    await page.waitForSelector('.tF2Cxc');

    let searchResults = [];
    let keepGoing = true;
    let attempts = 0;

    while (keepGoing && attempts < 10) {
      const links = await page.evaluate(() => {
        const items = document.querySelectorAll('.tF2Cxc');
        const urls = [];
        items.forEach(item => {
          const url = item.querySelector('a') ? item.querySelector('a').href : null;
          if (url) urls.push(url);
        });
        return urls;
      });

      for (const url of links) {
        try {
          const newPage = await browser.newPage();
          await newPage.goto(url, { waitUntil: 'domcontentloaded' });
          await newPage.waitForSelector('body', { timeout: 5000 });

          // Example of scraping the page title and a paragraph
          const pageData = await newPage.evaluate(() => {
            const pageTitle = document.querySelector('title') ? document.querySelector('title').innerText : '';
            const pageText = document.querySelector('p') ? document.querySelector('p').innerText : '';
            return { pageTitle, pageText };
          });

          searchResults.push({ url, ...pageData });
          await newPage.close();
        } catch (e) {
          console.log(`Error scraping ${url}: ${e.message}`);
        }
      }

      const nextButton = await page.$('#pnnext');
      if (nextButton) {
        await Promise.all([
          page.waitForNavigation(),
          nextButton.click(),
        ]);
      } else {
        keepGoing = false;
      }

      attempts++;
    }

    await browser.close();
    res.json(searchResults);
  } catch (error) {
    console.error('Error performing Google search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
