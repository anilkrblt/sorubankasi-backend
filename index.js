const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const publicRoutes = require('./routes/publicRoutes');
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const groupRoutes = require("./routes/groupRoutes");

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




app.use('/api', publicRoutes);

app.use("/api/exams", examRoutes);
app.use("/api/groups", groupRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
