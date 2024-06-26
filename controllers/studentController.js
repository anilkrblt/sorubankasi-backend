const Exam = require("../models/Exam");
const Group = require("../models/Group");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const mongoose = require("mongoose");

exports.updateExamScore = async (req, res) => {
  const { studentNo, examId, score } = req.body;

  try {
    const student = await Student.findOne({ ogrenci_no: studentNo });
    if (!student) {
      return res.status(404).send({ message: "Öğrenci bulunamadı." });
    }

    const exam = student.cozulen_sinavlar.find((exam) => exam.examId.toString() === examId);
    if (!exam) {
      return res.status(404).send({ message: "Sınav bulunamadı." });
    }

    exam.puan = score;
    await student.save();

    res.status(200).send({ message: "Puan başarıyla güncellendi." });
  } catch (error) {
    console.error("Puan güncellenirken bir hata oluştu:", error);
    res.status(500).send({ message: "Puan güncellenirken bir hata oluştu." });
  }
};
