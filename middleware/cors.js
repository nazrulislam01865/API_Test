const cors = require('cors');

const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

module.exports = cors(corsOptions);