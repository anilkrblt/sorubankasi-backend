const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateUser } = require('../middlewares/auth');

router.post('/', groupController.createGroup);
router.post('/:groupId/add-student', authenticateUser, groupController.addStudentToGroup);
router.post('/:groupId/remove-student', authenticateUser, groupController.removeStudentFromGroup);

module.exports = router;
