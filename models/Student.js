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
    examId: mongoose.Schema.Types.ObjectId,
    ders_kodu: String,
    sinav_adi: String,
    sorular: Array,
    cevaplar: Array,
    cozulme_tarihi: Date,
    puan: Number
  }]
},  { versionKey: false });

module.exports = mongoose.model('Student', studentSchema);
