const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema({
  type: { type: String, required: true, enum: ['public', 'private'] },
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  examName: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  questions: [{
    type: { type: String, required: true, enum: ['test', 'classic', 'code'] },
    text: { type: String, required: true },
    options: [String], // Only for 'test'
    correctAnswer: String, // Only for 'test'
    points: Number
  }],
  duration: Number,
  group: { type: Schema.Types.ObjectId, ref: 'Group' } // Only if private
});

module.exports = mongoose.model('Exam', examSchema);
