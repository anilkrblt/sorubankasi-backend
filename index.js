const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const publicRoutes = require('./routes/publicRoutes');
const cors = require("cors");
const session = require('express-session');
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // React uygulamanızın adresi
  credentials: true
}));

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // secure: true, only if you are using https
}));

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


app.use('/api/auth', authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/groups", groupRoutes);
app.use('/api', publicRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
