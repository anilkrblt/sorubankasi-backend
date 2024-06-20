const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  kullanici_adi: { type: String, required: true, unique: true }, 
  ad: { type: String, required: true },                         
  soyad: { type: String, required: true },                      
  email: { type: String, required: true, unique: true },
  tel_no: { type: String, required: true },                     
  hash_sifre: { type: String, required: true },
  olusturulan_gruplar: [{ type: Schema.Types.ObjectId, ref: 'Group' }],  
  hazirlanan_sinavlar: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]   
}, { versionKey: false });

module.exports = mongoose.model('Teacher', teacherSchema);
