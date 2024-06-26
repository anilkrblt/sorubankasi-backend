const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Group = require("../models/Group");

exports.updateProfile = async (req, res) => {
  const { kullanici_adi, email, ad, soyad } = req.body;
  const userId = req.session.user._id;
  console.log(userId);
  console.log(kullanici_adi), console.log(email, ",", ad, ",", soyad);
  try {
    let user;
    if (req.session.user.role === "student") {
      user = await Student.findByIdAndUpdate(
        userId,
        { kullanici_adi, email, ad, soyad },
        { new: true }
      );
    } else {
      user = await Teacher.findByIdAndUpdate(
        userId,
        { kullanici_adi, email, ad, soyad },
        { new: true }
      );
    }

    req.session.user = {
      _id: user._id,
      role: req.session.user.role,
      kullanici_adi: user.kullanici_adi,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad,
      groups: user.gruplar,
      cozulen_sinavlar: user.cozulen_sinavlar,
    };

    res.send({
      message: "Profile updated successfully.",
      user: req.session.user,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};
exports.register = async (req, res) => {
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
};
exports.login = async (req, res) => {
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
    if (user instanceof Student) {
      // Kullanıcının gruplarını bulun
      let groups = [];
      if (user.gruplar.length > 0) {
        groups = await Group.find({ _id: { $in: user.gruplar } });
      }
      let cozulen_sinavlar = [];
      if (user instanceof Student) {
        cozulen_sinavlar = user.cozulen_sinavlar || [];
      }
      req.session.user = {
        _id: user._id,
        role: "student",
        kullanici_adi: user.kullanici_adi,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        groups,
        cozulen_sinavlar,
      };
    }
    if (user instanceof Teacher) {
        // Kullanıcının oluşturulan gruplarını bulun
        let groups = [];
        if (user.olusturulan_gruplar.length > 0) {
          groups = await Group.find({ _id: { $in: user.olusturulan_gruplar } });
        }
        let hazirlanan_sinavlar = [];
        if (user instanceof Teacher) {
          hazirlanan_sinavlar = user.hazirlanan_sinavlar || [];
        }
        req.session.user = {
          _id: user._id,
          role: "teacher",
          kullanici_adi: user.kullanici_adi,
          tel: user.tel_no,
          ad: user.ad,
          soyad: user.soyad,
          email: user.email,
          groups,
          hazirlanan_sinavlar,
        };
      }

    res.send({
      message: "Giriş başarılı!",
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).send("Sunucu Hatası!");
  }
};
exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.session.user._id;

  try {
    // Kullanıcıyı oturumdaki role göre bulun
    let user;
    if (req.session.user.role === "student") {
      user = await Student.findById(userId);
    } else {
      user = await Teacher.findById(userId);
    }

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Eski şifreyi doğrula
    const validOldPassword = await bcrypt.compare(oldPassword, user.hash_sifre);
    if (!validOldPassword) {
      return res.status(400).send("Eski şifreniz sistemdekiyle uyuşmuyor.");
    }

    // Yeni şifreyi hashle ve kaydet
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.hash_sifre = hashedPassword;
    await user.save();

    res.send("Şifre başarıyla güncellendi.");
  } catch (error) {
    res.status(500).send("Server error.");
  }
};
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed.");
    }
    res.send({ message: "Logout successful." });
  });
};
exports.getUserGroups = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).send("Unauthorized.");
    }

    const groups = await Group.find({ _id: { $in: user.gruplar } });

    res.send({
      groups: groups.map((group) => ({
        _id: group._id,
        grup_adi: group.grup_adi,
        type: group.type,
        sinavlar: group.sinavlar,
      })),
    });
  } catch (error) {
    res.status(500).send("Server error.");
  }
};
exports.deleteAccount = async (req, res) => {
  const userId = req.body.user_id;

  try {
    const user =
      (await Teacher.findByIdAndDelete(userId)) ||
      (await Student.findByIdAndDelete(userId));

    if (!user) {
      return res.status(404).send("User not found.");
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error deleting session.");
      }
      res.send("Account deleted successfully.");
    });
  } catch (error) {
    res.status(500).send("Server error.");
  }
};
