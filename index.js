const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

let page; // simpan sesi login

app.get('/upcoming', async (req, res) => {
  try {
    if (!page) { 
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      page = await browser.newPage();
      await page.goto('https://v-class.gunadarma.ac.id/login/index.php');


      await page.type('#username', 'ammararief@student.gunadarma.ac.id'); 
      await page.type('#password', 'Prima12345'); 
      await page.click('#loginbtn');

      // tunggu hingga halaman terbuka setelah login
      await page.waitForNavigation();
    }

    // navigasi ke halaman yang akan di-scrape
    await page.goto('https://v-class.gunadarma.ac.id/calendar/view.php?view=upcoming', { timeout: 0 });

    // ambil data dari semua card pada halaman
    const cards = await page.$$eval('.card', elements =>
      elements.map(element => {
        const nameElement = element.querySelector('.name');
        const dateElement = element.querySelector('.col-xs-11 a');
        const eventTypeElement = element.querySelector('.col-xs-11:nth-child(2)');
        const descriptionElement = element.querySelector('.description-content');
        const courseElement = element.querySelector('.col-xs-11:last-child a');
        const linkElement = element.querySelector('.card-footer .card-link');

        // cek apakah elemen ada sebelum mengambil teks
        const name = nameElement ? nameElement.textContent : '';
        const date = dateElement ? dateElement.textContent : '';
        const eventType = eventTypeElement ? eventTypeElement.textContent : '';
        const description = descriptionElement ? descriptionElement.textContent : '';
        const course = courseElement ? courseElement.textContent : '';
        const link = linkElement ? linkElement.href : '';

        // cek apakah data kosong
        if (name === '') {
          return null;
        }

        return {
          name,
          date,
          eventType,
          description,
          course,
          link,
        };
      }).filter(card => card !== null) // filter data yang kosong
    );

    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
