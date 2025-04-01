const redis = require('redis');

const client = redis.createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.error('Redis Error:', err));
client.connect();

const checkConnection = async () => {
  try {
    await client.ping();
    return true;
  } catch (err) {
    console.error('Redis Connection Failed:', err);
    return false;
  }
};

module.exports = { client, checkConnection };