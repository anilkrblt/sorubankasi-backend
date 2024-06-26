const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');


router.get('/get-exams', examController.fetchExam)
router.post('/submit', examController.submitExam);
router.put('/update-exam', examController.updateExam); 
router.post('/', examController.createExam);


module.exports = router;
