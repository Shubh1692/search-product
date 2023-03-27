const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
// Find products from Amazon
const findProductFromAmazon = async (searchTerm) => {
  const url = `https://www.amazon.in/s?k=${searchTerm}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });
  const products = await page.$$eval('[data-csa-c-type="item"]', (elements) => {
    const p = [];
    elements.map((element) => {
      const product = {
        name: element.querySelector("h2 > a > span")?.innerHTML || "",
        image: element.querySelector("img")?.getAttribute("src") || "",
        price: Number(
          element
            .querySelector("span.a-price-whole")
            ?.innerHTML?.replace(/,/, "") || 0
        ),
      };
      if (product.name && product.image && product.price) {
        p.push(product);
      }
    });
    return p;
  });
  return products;
};
// Find products from Flipkart
const findProductFromFlipkart = async (searchTerm) => {
  const url = `https://www.flipkart.com/search?q=${searchTerm}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });
  const products = await page.$$eval("[data-id]", (elements) => {
    const p = [];
    elements.forEach((element) => {
      const product = {
        name:
          element.querySelector("div > a > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)")
            ?.innerHTML ||
          "",
        image: element.querySelector("img")?.getAttribute("src") || "",
        price: Number(
          element
            .querySelector('div > a > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
            ?.innerHTML?.replace(/₹/, "")
            .replace(/,/, "") || 0
        ),
      } 
      if (product.name && product.image && product.price) {
        p.push(product);
      }
    });
    return p;
  });
  return products;
};
// Find products from Reliance Digital
const findProductFromRelianceDigital = async (searchTerm) => {
  const url = `https://www.reliancedigital.in/search?q=${searchTerm}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });
  const products = await page.$$eval(".sp__product", (elements) => {
    const p = [];
    elements.forEach((element) => {
      
      const product = {
        name: element.querySelector(".sp__name")?.innerHTML || "",
        image: `https://www.reliancedigital.in/${element.querySelector("img")?.getAttribute("data-srcset") || ''}`,
        price: Number(
          element
            .querySelector(
              ".slider-text > div > div > div > span > span:nth-child(2)"
            )
            ?.innerHTML?.replace(/₹/, "")
            .replace(/,/, "") || 0
        ),
      };
      if (product.name && product.image && product.price) {
        p.push(product);
      }
    });
    return p;
  });
  return products;
};
// Find products from Croma (Unable to complete due to cross origin issue)
const findProductFromCroma = async (searchTerm) => {
  const url = `https://www.croma.com/search/?text=${searchTerm}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "load" });
  const products = await page.$$eval(".product-item", (elements) => {
    const p = []
    elements.map((element) => {
      const product = {
        name: "",
        image: "",
        price: 0,
      };
      if (product.name && product.image && product.price) {
        p.push(product);
      }
    });
    return p;
  });
  return products;
};
// Endpoint search product from Amazon, Flipkart, Reliance Digital, and Croma
app.get("/search", async (req, res) => {
  const searchTerm = req.query.q;
  const [amazon, flipkart, reliance_digital, croma] = await Promise.all([
    findProductFromAmazon(searchTerm),
    findProductFromFlipkart(searchTerm),
    findProductFromRelianceDigital(searchTerm),
    findProductFromCroma(searchTerm),
  ]);
  res.send({
    result: {
      amazon,
      flipkart,
      reliance_digital,
      croma,
    },
  });
});
// Start the server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server started on port ${process.env.PORT || 3002}`);
});
