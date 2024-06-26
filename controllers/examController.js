const Exam = require("../models/Exam");
const Group = require("../models/Group");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const mongoose = require("mongoose");

exports.createExam = async (req, res) => {
  const {
    type,
    ders_kodu,
    ders_adi,
    test_adi,
    sorular,
    sinav_suresi,
    grup_id,
    hazirlayan_id,
  } = req.body;

  const exam = new Exam({
    type,
    ders_kodu,
    ders_adi,
    test_adi,
    hazirlayan_id,
    sorular,
    sinav_suresi,
    grup_id: grup_id || null,
    cozumler: [],
  });

  console.log("Creating exam with data:", exam);

  try {
    await exam.save();
    console.log("Exam saved successfully:", exam);

    const user = await Teacher.findById(hazirlayan_id);
    if (!user) {
      throw new Error("Teacher not found");
    }
    user.hazirlanan_sinavlar.push(exam._id);
    await user.save();
    console.log("Teacher updated successfully:", user);

    if (grup_id) {
      const group = await Group.findById(grup_id);
      if (group) {
        group.sinavlar.push(exam._id);
        await group.save();
        console.log("Group updated successfully:", group);
      }
    }

    res.status(201).send({ message: "Sınav oluşturuldu.", exam });
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(400).send({
      message: "Sınav oluşturmada hata meydana geldi",
      error: error.message,
    });
  }
};
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

exports.updateExam = async (req, res) => {
  const { examId, newQuestions, sinav_suresi } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send({ message: "Sınav bulunamadı." });
    }

    exam.sorular = newQuestions;
    exam.sinav_suresi = sinav_suresi;
    await exam.save();

    res.status(200).send({ message: "Sınav başarıyla güncellendi.", exam });
  } catch (error) {
    console.error("Sınav güncellenirken bir hata oluştu:", error);
    res.status(500).send({ message: "Sınav güncellenirken bir hata oluştu." });
  }
};

exports.submitExam = async (req, res) => {
  const { examId, answers, userId } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).send("Exam not found.");
    }

    const result = {
      examId,
      ders_kodu: exam.ders_kodu,
      sinav_adi: exam.test_adi,
      sorular: exam.sorular,
      cevaplar: answers,
      cozulme_tarihi: new Date(),
      puan: -1,
    };

    // Öğrencinin çözülen sınavlarına sonucu ekleyin
    const student = await Student.findById(userId);

    if (!student) {
      return res.status(404).send("Student not found.");
    }
    student.cozulen_sinavlar.push(result);
    await student.save();

    res.status(200).send("Exam submitted successfully.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.fetchExam = async (req, res) => {
  const { examIds } = req.query;
  const examIdArray = examIds ? examIds.split(",") : [];
  console.log(examIdArray);

  if (examIdArray.length === 0) {
    return res.status(400).send({ message: "Geçersiz sınav ID'leri." });
  }

  try {
    const objectIdArray = examIdArray.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const exams = await Exam.find({ _id: { $in: objectIdArray } }).lean();

    const studentList = await Student.find({
      "cozulen_sinavlar.examId": { $in: objectIdArray },
    }).lean();

    const examsWithSolvers = exams.map((exam) => {
      const solvers = studentList
        .filter((student) =>
          student.cozulen_sinavlar.some((sinav) =>
            sinav.examId.equals(exam._id)
          )
        )
        .map((student) => {
          const relatedExam = student.cozulen_sinavlar.find((sinav) =>
            sinav.examId.equals(exam._id)
          );
          return {
            ad: student.ad,
            soyad: student.soyad,
            ogrenci_no: student.ogrenci_no,
            cozum: relatedExam,
          };
        });
      return {
        ...exam,
        cozenler: solvers,
      };
    });

    res.status(200).send({ exams: examsWithSolvers });
  } catch (error) {
    console.error("Sınavlar getirilirken bir hata oluştu:", error);
    res.status(500).send({
      message: "Sınavlar getirilirken bir hata oluştu",
      error: error.message,
    });
  }
};
