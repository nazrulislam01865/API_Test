// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const gradesController = require('../controllers/gradesController');  // ✅ Import controller

// Define routes
router.get('/grades', gradesController.getGrades);
router.get('/cgpa', gradesController.getCGPA);
router.get('/finance', gradesController.getFinance);
router.get('/schedule', gradesController.getSchedule);
router.get('/notices', gradesController.getNotices);
router.get('/profile', gradesController.getProfile);

module.exports = router;
