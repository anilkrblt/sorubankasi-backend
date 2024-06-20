const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateUser } = require('../middlewares/auth');

router.post('/', authenticateUser, examController.createExam);

module.exports = router;
