const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.put('/update-exam-score', studentController.updateExamScore);

module.exports = router;
