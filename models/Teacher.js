const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  createdExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]
});

module.exports = mongoose.model('Teacher', teacherSchema);
