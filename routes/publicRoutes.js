const express = require('express');
const router = express.Router();
const { getPublicGroupsAndExams } = require('../controllers/publicController');

router.get('/public-data', getPublicGroupsAndExams);

module.exports = router;
