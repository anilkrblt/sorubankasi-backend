const express = require('express');
const router = express.Router();
const { getPublicGroupsAndExams } = require('../controllers/publicController');

// Route to get public groups and exams
router.get('/public-data', getPublicGroupsAndExams);

module.exports = router;
