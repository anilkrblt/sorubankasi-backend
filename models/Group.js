const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['public', 'private'] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  members: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]
});

module.exports = mongoose.model('Group', groupSchema);
