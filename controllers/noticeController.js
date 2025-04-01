const axios = require('axios');
const cheerio = require('cheerio');

const getNotices = async (req, res) => {
  const response = await axios.get(process.env.AIUB_HOME_URL);
  const $ = cheerio.load(response.data);
  const notices = $('.notice-page .notification').slice(0, 10).map((_, notice) => {
    const title = $('.notification-text', notice).text().trim();
    const date = $('.date-custom', notice).text().trim().replace(/\r\n/g, ' ');
    const link = $('a', notice).attr('href');
    const fullLink = link?.startsWith('http') || link?.startsWith('www') ? link : `${process.env.AIUB_HOME_URL}${link}`;
    return date ? `${date}::${title}::${fullLink || ''}` : `${title}::${fullLink || ''}`;
  }).get();

  res.json({ status: 'success', notices });
};

const subscribe = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Push notifications not implemented' });
};

const unsubscribe = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Push notifications not implemented' });
};

module.exports = { getNotices, subscribe, unsubscribe };