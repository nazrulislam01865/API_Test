const express = require('express');
const { loginHandler } = require('../controllers/authController');
const { getNotices, subscribe, unsubscribe } = require('../controllers/noticeController');

const router = express.Router();

router.get('/', (req, res) => res.send('<h2>Welcome to AIUB Portal API v2</h2>'));
router.get('/login', loginHandler);
router.get('/notices', getNotices);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

module.exports = router;