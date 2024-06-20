const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Teacher = require("./models/Teacher");
const Student = require("./models/Student");
const Group = require("./models/Group");
const Exam = require("./models/Exam");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware to authenticate with email and password
const authenticateUser = async (req, res, next) => {
  const { email, password } = req.headers;

  if (!email || !password) {
    return res.status(401).send("Access denied. No credentials provided.");
  }

  try {
    const user =
      (await Teacher.findOne({ email })) || (await Student.findOne({ email }));

    if (!user) {
      return res.status(400).send("Invalid email or password.");
    }

    const validPassword = await bcrypt.compare(password, user.hash_sifre);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password.");
    }

    req.user = user; // Kullanıcıyı req.user'a ekle
    next();
  } catch (error) {
    res.status(500).send("Server error.");
  }
};

// Route for user registration
app.post("/api/register", async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    password,
    studentNumber,
    tel_no,
    role,
  } = req.body;
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
});

// Route for user login (No token, just check credentials)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user =
      (await Teacher.findOne({ email })) || (await Student.findOne({ email }));

    if (!user) {
      return res.status(400).send("Invalid email or password.");
    }

    const validPassword = await bcrypt.compare(password, user.hash_sifre);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password.");
    }

    res.send({ message: "Login successful." });
  } catch (error) {
    res.status(500).send("Server error.");
  }
});

// Route to update user password
app.post("/api/update-password", authenticateUser, async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user._id; // Kullanıcıyı authenticateUser middleware'den alıyoruz

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  try {
    if (req.user instanceof Student) {
      await Student.findByIdAndUpdate(userId, { hash_sifre: hashedPassword });
    } else {
      await Teacher.findByIdAndUpdate(userId, { hash_sifre: hashedPassword });
    }
    res.send("Password updated successfully.");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Route to add a new exam (Only teachers)
app.post("/api/exams", authenticateUser, async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }
  const { ders_kodu, ders_adi, test_adi, sorular, sinav_suresi, grup_id } =
    req.body;

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

    // Eğer sınav bir gruba aitse, sınavı gruba ekleyin
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
});

// Additional routes for managing groups and exams
app.post("/api/groups", authenticateUser, async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).send("Access denied.");
  }
  const { grup_adi, type } = req.body;

  const group = new Group({
    grup_adi,
    type,
    olusturan_id: req.user._id,
    uyeler: [],
    sinavlar: [],
  });

  try {
    await group.save();
    res.status(201).send("Group created.");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Adding student to a group (Teachers only)
app.post("/api/groups/:groupId/add-student", authenticateUser, async (req, res) => {
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
});

// Removing student from a group (Teachers only)
app.post(
  "/api/groups/:groupId/remove-student",
  authenticateUser,
  async (req, res) => {
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
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
