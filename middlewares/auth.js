const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send("Access denied. No credentials provided.");
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

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
