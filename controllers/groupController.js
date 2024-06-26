const Group = require("../models/Group");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

exports.createGroup = async (req, res) => {
  const { grup_adi, sinavlar, uyeler, olusturan_id, type } = req.body;
  console.log(uyeler);

  try {
    const studentIds = await Promise.all(
      uyeler.map(async (uye) => {
        const student = await Student.findOne({
          ogrenci_no: uye.ogrenci_no.studentNumber,
        });
        if (!student) {
          throw new Error(
            `Öğrenci numarası ${uye.ogrenci_no} olan öğrenci bulunamadı.`
          );
        }
        return student._id;
      })
    );

    const newGroup = new Group({
      grup_adi,
      type,
      olusturan_id,
      uyeler: studentIds || [],
      sinavlar,
    });

    const savedGroup = await newGroup.save();

    await Promise.all(
      studentIds.map(async (studentId) => {
        await Student.findByIdAndUpdate(
          studentId,
          { $push: { gruplar: savedGroup._id } },
          { new: true, useFindAndModify: false }
        );
      })
    );

    await Teacher.findByIdAndUpdate(
      olusturan_id,
      { $push: { olusturulan_gruplar: savedGroup._id } },
      { new: true, useFindAndModify: false }
    );


    res.status(201).json({ group: savedGroup });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Grup oluşturulamadı." });
  }
};

exports.addStudentToGroup = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }
  const { studentId } = req.body;

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).send("Group not found.");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send("Student not found.");
    }

    if (!group.uyeler.includes(studentId)) {
      group.uyeler.push(studentId);
      await group.save();

      student.gruplar.push(group._id);
      await student.save();
    }

    res.status(200).send("Student added to the group.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
exports.removeStudentFromGroup = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }
  const { studentId } = req.body;

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).send("Group not found.");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send("Student not found.");
    }

    group.uyeler.pull(studentId);
    await group.save();

    student.gruplar.pull(group._id);
    await student.save();

    res.status(200).send("Student removed from the group.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
exports.updateGroup = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }
  const { grup_adi, type } = req.body;

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).send("Group not found.");
    }

    if (grup_adi) group.grup_adi = grup_adi;
    if (type) group.type = type;

    await group.save();
    res.status(200).send("Group updated.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
exports.deleteGroup = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).send("Group not found.");
    }

    // Remove group from all students' groups list
    await Student.updateMany(
      { gruplar: group._id },
      { $pull: { gruplar: group._id } }
    );

    // Delete the group
    await group.remove();
    res.status(200).send("Group deleted.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
