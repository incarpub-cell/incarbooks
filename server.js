const express = require('express');
const fetch = require('cross-fetch');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: '.env.local' });

const app = express();
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT = 8888 } = process.env;
const base = "https://api-m.sandbox.paypal.com";

const logFile = path.join(__dirname, 'server-debug.log');
function logToFile(msg) {
  const entry = `${new Date().toISOString()} - ${msg}\n`;
  fs.appendFileSync(logFile, entry);
  console.log(msg);
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PayPal Backend is Running! 🚀");
});

app.use((req, res, next) => {
  logToFile(`${req.method} ${req.url}`);
  next();
});

async function generateAccessToken() {
  const cid = process.env.PAYPAL_CLIENT_ID;
  const sec = process.env.PAYPAL_CLIENT_SECRET;
  logToFile(`Verifying creds - ID: ${cid?.substring(0, 8)}..., Secret: ${sec?.substring(0, 8)}...`);
  if (!cid || !sec) {
    logToFile("ERROR: Missing PayPal credentials in .env.local");
    throw new Error("MISSING_PAYPAL_CREDENTIALS");
  }
  const auth = Buffer.from(cid + ":" + sec).toString("base64");
  logToFile("Requesting PayPal Access Token...");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logToFile(`PayPal Auth Error (${response.status}): ${errorText}`);
    throw new Error("PAYPAL_AUTH_FAILED");
  }

  const data = await response.json();
  logToFile("Access Token obtained.");
  return data.access_token;
}

app.post("/api/orders", async (req, res) => {
  try {
    const { cart } = req.body;
    logToFile(`Creating order for: ${JSON.stringify(cart)}`);
    const totalValue = cart && cart[0] && cart[0].price ? cart[0].price.toString() : "0.01";

    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: totalValue,
          },
        }],
      }),
    });

    const data = await response.json();
    logToFile(`Order created: ${data.id}`);
    res.json(data);
  } catch (error) {
    logToFile(`Order Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    logToFile(`Capturing order: ${orderID}`);
    const accessToken = await generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    logToFile(`Capture result: ${data.status}`);
    res.json(data);
  } catch (error) {
    logToFile(`Capture Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  logToFile(`Server started on http://127.0.0.1:${PORT}`);
});
