const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  kullanici_adi: { type: String, required: true, unique: true },
  ad: { type: String, required: true },        
  soyad: { type: String, required: true },  
  ogrenci_no: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  hash_sifre: { type: String, required: true },
  gruplar: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  cozulen_sinavlar: [{
    sinavlar: { type: Schema.Types.ObjectId, ref: 'Exam' },
    cevaplar: [String],
    puan: Number
  }]
},  { versionKey: false });

module.exports = mongoose.model('Student', studentSchema);
