const axios = require('axios');
const cheerio = require('cheerio');
const { client, checkConnection } = require('../services/redisService');
const { updateClients } = require('../services/webpushService');

const getNotices = async (req, res) => {
  if (!(await checkConnection())) return res.status(500).json({ status: 'error', message: 'Redis connection error' });

  const response = await axios.get(process.env.AIUB_HOME_URL);
  const $ = cheerio.load(response.data);
  const notices = $('.notice-page .notification').slice(0, 10).map((_, notice) => {
    const title = $('.notification-text', notice).text().trim();
    const date = $('.date-custom', notice).text().trim().replace(/\r\n/g, ' ');
    const link = $('a', notice).attr('href');
    const fullLink = link?.startsWith('http') || link?.startsWith('www') ? link : `${process.env.AIUB_HOME_URL}${link}`;
    return date ? `${date}::${title}::${fullLink || ''}` : `${title}::${fullLink || ''}`;
  }).get();

  const redisNotices = (await client.lRange(process.env.NOTICE_CHANNEL, 0, -1)).map(n => n.toString());
  const newNotices = notices.filter(n => !redisNotices.includes(n));
  if (!redisNotices.length) await client.rPush(process.env.NOTICE_CHANNEL, notices);
  else if (newNotices.length) {
    await client.del(process.env.NOTICE_CHANNEL);
    await client.rPush(process.env.NOTICE_CHANNEL, notices);
    await updateClients(newNotices, 'American International University - Bangladesh', 'aiub');
  }

  res.json({ status: 'success', notices });
};

const subscribe = async (req, res) => {
  const subscription = req.body;
  await client.sAdd(process.env.CLIENTS_KEY, JSON.stringify(subscription));
  res.json({ status: 'success', message: 'Subscribed successfully' });
};

const unsubscribe = async (req, res) => {
  const subscription = req.body;
  if (!(await client.sIsMember(process.env.CLIENTS_KEY, JSON.stringify(subscription)))) {
    return res.status(404).json({ status: 'error', message: 'Subscription not found' });
  }
  await client.sRem(process.env.CLIENTS_KEY, JSON.stringify(subscription));
  res.json({ status: 'success', message: 'Unsubscribed successfully' });
};

module.exports = { getNotices, subscribe, unsubscribe };