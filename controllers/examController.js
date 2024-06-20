const Exam = require('../models/Exam');
const Group = require('../models/Group');
const mongoose = require('mongoose');

// Create a new exam
exports.createExam = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }
  const { ders_kodu, ders_adi, test_adi, sorular, sinav_suresi, grup_id } = req.body;

  const exam = new Exam({
    type: grup_id ? "private" : "public",
    ders_kodu,
    ders_adi,
    test_adi,
    hazirlayan_id: req.user._id,
    sorular,
    sinav_suresi,
    grup_id: grup_id || null,
    cozumler: [],
  });

  try {
    await exam.save();

    if (grup_id) {
      const group = await Group.findById(grup_id);
      if (group) {
        group.sinavlar.push(exam._id);
        await group.save();
      }
    }

    res.status(201).send("Exam created.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }

  const { examId } = req.params;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send("Exam not found.");
    }

    // Eğer sınav bir gruba aitse, sınavı gruptan da kaldırın
    if (exam.grup_id) {
      const group = await Group.findById(exam.grup_id);
      if (group) {
        group.sinavlar.pull(exam._id);
        await group.save();
      }
    }

    await exam.remove();
    res.status(200).send("Exam deleted.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Update an exam
exports.updateExam = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }

  const { examId } = req.params;
  const { test_adi, sinav_suresi, sorular } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send("Exam not found.");
    }

    // Güncelleme
    if (test_adi) exam.test_adi = test_adi;
    if (sinav_suresi) exam.sinav_suresi = sinav_suresi;

    // Soruların güncellenmesi
    if (sorular) {
      sorular.forEach((newQuestion) => {
        const questionIndex = exam.sorular.findIndex(
          q => q._id && q._id.toString() === newQuestion.soru_id
        );
        
        if (questionIndex > -1) {
          // Var olan bir soruyu güncelle
          exam.sorular[questionIndex] = { ...exam.sorular[questionIndex], ...newQuestion };
        } else {
          // Yeni bir soru ekle
          if (!newQuestion.soru_id) {
            newQuestion.soru_id = new mongoose.Types.ObjectId(); // Yeni bir ObjectId oluştur
          }
          exam.sorular.push(newQuestion);
        }
      });

      // Silinecek soruları kontrol et
      exam.sorular = exam.sorular.filter(existingQuestion =>
        sorular.some(newQuestion =>
          newQuestion.soru_id && newQuestion.soru_id.toString() === existingQuestion._id.toString()
        )
      );
    }

    await exam.save();
    res.status(200).send("Exam updated.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
