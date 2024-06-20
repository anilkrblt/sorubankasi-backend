const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  soru_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), index: true },
  soru_tipi: { type: String, required: true, enum: ['test', 'klasik', 'kod'] },
  soru_metni: { type: String, required: true },
  cevaplar: [String], // Only for 'test'
  dogru_cevap: String, // Only for 'test'
  puan: { type: Number, required: true }
});

const examSchema = new Schema({
  type: { type: String, required: true, enum: ['public', 'private'] },
  ders_kodu: { type: String, required: true },
  ders_adi: { type: String, required: true },
  test_adi: { type: String, required: true },
  hazirlayan_id: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  sorular: [questionSchema],
  sinav_suresi: { type: Number, required: true },
  grup_id: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
  cozumler: [{ type: Schema.Types.ObjectId, ref: 'Solution' }]
});

module.exports = mongoose.model('Exam', examSchema);
