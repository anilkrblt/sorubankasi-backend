const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.authenticateUser = async (req, res, next) => {
  const { email, password } = req.headers;

  if (!email || !password) {
    return res.status(401).send("Access denied. No credentials provided.");
  }

  try {
    const user = await Teacher.findOne({ email }) || await Student.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid email or password.");
    }

    const validPassword = await bcrypt.compare(password, user.hash_sifre);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).send("Server error.");
  }
};
