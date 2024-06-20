const Group = require('../models/Group');
const Exam = require('../models/Exam');

exports.getPublicGroupsAndExams = async (req, res) => {
  try {
    const publicGroups = await Group.find({ type: 'public' }).populate('uyeler', 'ad soyad email');
    const publicExams = await Exam.find({ type: 'public' }).populate('hazirlayan_id', 'ad soyad email');

    res.status(200).json({
      publicGroups,
      publicExams
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
