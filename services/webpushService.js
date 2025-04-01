const webpush = require('web-push');
const dotenv = require('dotenv');
const { client } = require('./redisService');

// Load environment variables
dotenv.config();

// Ensure VAPID keys are loaded properly
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BOmR6jEsmfxIh9uASc9nI_Pg_iwWNgbQ_81KgmlAGtcAbi2oKf4kz14_3czfTOd7chu4hm0rWu5HJS8IpeGp-Xg',
  privateKey: process.env.VAPID_PRIVATE_KEY || '3flgY3nJY3nBTscagm25tKy9J8a91ZreNYY_iwKt8yQ',
};

// Debugging: Check if keys are being loaded
console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  throw new Error("VAPID keys are missing! Check your .env file or hardcoded keys.");
}

// Use the correct keys in webpush setup
webpush.setVapidDetails('mailto:fuad.cs22@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

const sendWebPush = async (subscription, messageBody, title, type) => {
  const payload = JSON.stringify({ body: messageBody, title, type });
  await webpush.sendNotification(subscription, payload, { TTL: 86400 });
};

const updateClients = async (notices, title, noticeType) => {
  const clients = await client.sMembers(process.env.CLIENTS_KEY);
  for (const clientData of clients) {
    try {
      const subscription = JSON.parse(clientData);
      for (const notice of notices.reverse()) {
        await sendWebPush(subscription, notice, title, noticeType);
      }
    } catch (err) {
      if (err.statusCode === 410) {
        await client.sRem(process.env.CLIENTS_KEY, clientData);
        console.log(`Removed unsubscribed client: ${subscription.endpoint}`);
      } else {
        console.error('WebPush Error:', err);
      }
    }
  }
};

module.exports = { sendWebPush, updateClients };
