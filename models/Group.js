const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  grup_adi: { type: String, required: true },  
  type: { type: String, required: true, enum: ['public', 'private'] },
  olusturan_id: { type: Schema.Types.ObjectId, ref: 'Teacher' }, 
  uyeler: [{ type: Schema.Types.ObjectId, ref: 'Student' }],    
  sinavlar: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]      
}, { versionKey: false });

module.exports = mongoose.model('Group', groupSchema);
