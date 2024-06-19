const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Group = require('./models/Group');
const Exam = require('./models/Exam');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Auth middleware to protect routes
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};

// Route for user registration
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body; // Add more fields as necessary
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = role === 'teacher' ? new Teacher({ email, password: hashedPassword }) : new Student({ email, password: hashedPassword });
  
  try {
    await user.save();
    res.status(201).send('User registered.');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Route for user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await Teacher.findOne({ email }) || await Student.findOne({ email });

  if (!user) {
    return res.status(400).send('Invalid email or password.');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid email or password.');
  }

  const token = jwt.sign({ _id: user._id, role: user instanceof Teacher ? 'teacher' : 'student' }, process.env.JWT_SECRET);
  res.send({ token });
});

// Route to add a new exam (Only teachers)
app.post('/api/exams', requireAuth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).send('Access denied.');
  }
  const { subjectCode, subjectName, examName, questions, duration } = req.body; // Assuming this is a simplified version

  const exam = new Exam({
    subjectCode,
    subjectName,
    examName,
    createdBy: req.user._id,
    questions,
    duration
  });

  try {
    await exam.save();
    res.status(201).send('Exam created.');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Additional routes for updating and deleting exams, managing groups, etc.

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
