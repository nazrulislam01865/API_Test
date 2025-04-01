const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

dotenv.config();

console.log('dotenv loaded');
console.log('PORT:', process.env.PORT);
console.log('VAPID_PUBLIC_KEY:', process.env.VAPID_PUBLIC_KEY);
console.log('VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173'] }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});