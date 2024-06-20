const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.register = async (req, res) => {
  const { username, firstName, lastName, email, password, studentNumber, tel_no, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  let user;
  if (role === "teacher") {
    user = new Teacher({
      kullanici_adi: username,
      ad: firstName,
      soyad: lastName,
      email,
      tel_no,
      hash_sifre: hashedPassword,
    });
  } else {
    user = new Student({
      kullanici_adi: username,
      ad: firstName,
      soyad: lastName,
      ogrenci_no: studentNumber,
      email,
      hash_sifre: hashedPassword,
    });
  }

  try {
    await user.save();
    res.status(201).send("User registered.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Teacher.findOne({ email }) || await Student.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid email or password.");
    }

    const validPassword = await bcrypt.compare(password, user.hash_sifre);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password.");
    }

    const token = jwt.sign(
      { _id: user._id, role: user instanceof Teacher ? "teacher" : "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.send({ token });
  } catch (error) {
    res.status(500).send("Server error.");
  }
};

exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user._id;

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  try {
    if (req.user.role === "student") {
      await Student.findByIdAndUpdate(userId, { hash_sifre: hashedPassword });
    } else {
      await Teacher.findByIdAndUpdate(userId, { hash_sifre: hashedPassword });
    }
    res.send("Password updated successfully.");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
