const express = require("express");
const cors = require("cors");
const { Builder, By, until } = require("selenium-webdriver");
const proxy = require("selenium-webdriver/proxy");
const uuid = require("uuid");
const dotenv = require("dotenv");
const axios = require("axios");
const chrome = require("selenium-webdriver/chrome");
const Trend = require("./model/trendSchema");
const db = require("./db.js");

dotenv.config();

const { PROXYMESH_URL, PORT } = process.env;

if (!PROXYMESH_URL) {
  console.log("PROXYMESH_URL is not set");
}

const app = express();
app.use(cors());
app.use(express.json());

// Scraping Function
const scrapeTwitterTrends = async () => {
  const options = new chrome.Options();
  options.addArguments("--disable-blink-features=AutomationControlled");
  options.addArguments("--incognito");
  options.addArguments("--start-maximized");

  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setProxy(
      proxy.manual({
        http: PROXYMESH_URL,
        https: PROXYMESH_URL,
      })
    )
    .build();

  try {
    console.log("Navigating to Twitter home page.");
    await driver.get("https://x.com/home");

    // Wait for the user to login and then what's happening section to load
    await driver.sleep(30000);

    // Scraping trending topics
    const trends = [];
    const trendElements = await driver.findElements(
      By.css("div[data-testid='trend']")
    );
    for (let i = 0; i < trendElements.length; i++) {
      const trendText = await trendElements[i].getText();
      trends.push(trendText);
    }

    console.log("Scraped trends:", trends);

    // Get IP address and save the record
    const ipAddress = PROXYMESH_URL
      ? PROXYMESH_URL.split("@")[1].split(":")[0]
      : await getPublicIP();

    const record = {
      unique_id: uuid.v4(),
      trends,
      timestamp: new Date(),
      ip_address: ipAddress,
    };
    await new Trend(record).save();
    console.log("Record saved to database:", record);

    return record;
  } catch (error) {
    console.error("Script execution error:", error.stack);
    throw error;
  } finally {
    await driver.quit();
  }
};

// API to run scraping
app.post("/run-script", async (req, res) => {
  try {
    console.log(`Starting scraping at ${new Date().toISOString()}`);
    const record = await scrapeTwitterTrends();
    console.log("Scraping completed successfully.");
    res.status(200).json(record);
  } catch (error) {
    console.error(`Script execution error:`, error.stack);
    res.status(500).json({
      message: "Script execution failed",
      error: error.message,
      stack: error.stack,
    });
  }
});

// API to fetch the trending tags
app.get("/trending", async (req, res) => {
  try {
    const latestRecord = await Trend.findOne().sort({ timestamp: -1 });
    if (!latestRecord) {
      return res.status(404).json({ message: "No records found." });
    }
    res.status(200).json(latestRecord);
  } catch (error) {
    console.error("Error fetching latest record:", error.message);
    res.status(500).json({
      message: "Failed to fetch latest record.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
