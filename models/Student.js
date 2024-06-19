const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  takenExams: [{
    exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
    answers: [String],
    score: Number
  }]
});

module.exports = mongoose.model('Student', studentSchema);
