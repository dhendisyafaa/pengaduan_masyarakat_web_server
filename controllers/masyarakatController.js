import bcrypt from "bcrypt"; // Untuk hashing password
import db from "../config/database.js"; //

// import file Model
import Masyarakat from "../models/masyarakatModel.js";
import Pengaduan from "../models/pengaduanModel.js";
import Tanggapan from "../models/tanggapanModel.js";

// Mengambil seluruh data Masyarakat
export const getMasyarakat = async (req, res) => {
  try {
    // Menggunakan model Masyarakat untuk mengambil data
    const resMasyarakat = await Masyarakat.findAll({
      attributes: {
        exclude: ["password"],
      }, // Menghindari mengirimkan password
    });

    if (resMasyarakat && resMasyarakat.length > 0) {
      // Mengirimkan respons JSON jika data ditemukan
      res.json(resMasyarakat);
    } else {
      // Mengirimkan respons 404 jika tidak ditemukan
      res.json({
        message: "Tidak ada data masyarakat ditemukan.",
      });
    }
  } catch (error) {
    console.error(error);
    // Mengirimkan respons 500 jika terjadi kesalahan dalam proses
    res.status(500).json({
      message: "Terjadi kesalahan dalam mengambil data masyarakat.",
    });
  }
};

// Mengambil data Masyarakat berdasarkan UUID, termasuk informasi Pengaduan dan Tanggapan terkait.
export const getMasyarakatByUUID = async (req, res) => {
  try {
    // Mencari Masyarakat dengan UUID yang sesuai
    const uuid = req.params.uuid;
    const resMasyarakatId = await Masyarakat.findOne({
      attributes: {
        exclude: ["password"],
      },
      where: {
        uuid,
      },
      include: {
        model: Pengaduan,
        as: "memiliki_pengaduan", // Termasuk data Pengaduan
        include: {
          model: Tanggapan,
          as: "memiliki_tanggapan", // Termasuk data Tanggapan
        },
      },
    });

    if (resMasyarakatId) {
      // Mengirimkan respons JSON jika data ditemukan
      res.json(resMasyarakatId);
    } else {
      // Mengirimkan respons 404 jika data tidak ditemukan
      res.status(404).json({
        message: "Masyarakat dengan UUID yang diberikan tidak ditemukan.",
      });
    }
  } catch (error) {
    console.error(error);
    // Mengirimkan respons 500 jika terjadi kesalahan dalam proses
    res.status(500).json({
      message: "Terjadi kesalahan dalam mengambil UUID masyarakat.",
    });
  }
};

// Membuat data Masyarakat baru
export const createMasyarakat = async (req, res) => {
  try {
    // Validasi input (pastikan semua bidang yang diperlukan diisi)
    const { nik, nama, username, password, telp } = req.body;
    if (!nik || !nama || !username || !password || !telp) {
      return res.status(400).json({
        message: "Semua bidang harus diisi.",
      });
    }

    // Cek apakah NIK sudah ada dalam database
    const foundMasyarakat = await Masyarakat.findOne({ where: { nik } });
    if (foundMasyarakat) {
      return res.status(400).json({
        message: "NIK sudah digunakan.",
      });
    }

    // Daftar field yang sah dalam model Masyarakat
    const validFields = ["nik", "nama", "username", "password", "telp"];

    // Temukan field yang tidak valid
    const invalidFields = Object.keys(req.body).filter(
      (field) => !validFields.includes(field)
    );

    // Jika ada field yang invalid, kirim pesan error
    if (invalidFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Invalid fields: ${invalidFields.join(", ")}` });
    }

    // Hash kata sandi sebelum menyimpannya
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Gunakan Sequelize Model untuk menyimpan data
    const masyarakat = await Masyarakat.create({
      nik,
      nama,
      username,
      password: hashedPassword, // Gunakan kata sandi yang sudah di-hash
      telp,
    });

    // Berikan respons JSON sukses dengan data yang disimpan
    res.status(201).json({
      message: "Data masyarakat berhasil disimpan",
      data: masyarakat,
    });
  } catch (error) {
    console.error(error);
    // Berikan respons JSON kesalahan jika terjadi masalah
    res.status(500).json({
      message: "Terjadi kesalahan dalam menyimpan data masyarakat.",
    });
  }
};

// Mengupdate data Masyarakat berdasarkan UUID
export const updateMasyarakat = async (req, res) => {
  try {
    // Ambil data Masyarakat dari database sebelum pembaruan
    const uuid = req.params.uuid;
    const masyarakat = await Masyarakat.findOne({ where: { uuid } });

    // Jika Masyarakat tidak ditemukan, kirim respons 404
    if (!masyarakat) {
      return res.status(404).json({ message: "Masyarakat not found" });
    }

    // Daftar field yang sah dalam model Masyarakat
    const validFields = ["nik", "nama", "username", "password", "telp"];

    // Temukan field yang tidak valid
    const invalidFields = Object.keys(req.body).filter(
      (field) => !validFields.includes(field)
    );

    // Jika ada field yang invalid, kirim pesan error
    if (invalidFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Invalid fields: ${invalidFields.join(", ")}` });
    }

    // Persiapkan objek pembaruan dengan nilai-nilai default dari data yang ada
    const updates = {
      nama: req.body.nama || masyarakat.nama,
      username: req.body.username || masyarakat.username,
      password: req.body.hasOwnProperty("password")
        ? await bcrypt.hash(req.body.password, 10) // Hash kata sandi baru jika ada
        : masyarakat.password, // Gunakan kata sandi yang ada jika tidak ada pembaruan
      telp: req.body.telp || masyarakat.telp,
    };

    // Melakukan pembaruan data di database berdasarkan UUID
    const [updatedRowCount] = await Masyarakat.update(updates, {
      where: { uuid },
    });

    // Jika tidak ada pembaruan yang berhasil dilakukan, kirim respons 404
    if (updatedRowCount === 0) {
      return res.status(404).json({ message: "Masyarakat not found" });
    } else {
      // Jika pembaruan berhasil, kirim respons 200
      return res
        .status(200)
        .json({ message: "Masyarakat updated successfully" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam memperbarui data masyarakat." });
  }
};

// Menghapus data Masyarakat berdasarkan NIK, termasuk informasi Pengaduan dan Tanggapan terkait.
export const deleteMasyarakat = async (req, res) => {
  let transaction;

  try {
    const { nik } = req.params;

    // Memulai transaksi
    transaction = await db.transaction();

    // Mengambil seluruh data Pengaduan yang dimiliki oleh Masyarakat dengan NIK yang sesuai
    const pengaduanIds = await Pengaduan.findAll({
      where: { nik },
      attributes: ["id_pengaduan"], // Ambil hanya id_pengaduan
      raw: true, // Hasilkan data dalam bentuk objek biasa
    });

    // Menghapus data Tanggapan yang memiliki id_pengaduan yang sesuai dengan id_pengaduan yang dimiliki oleh Masyarakat
    await Tanggapan.destroy({
      where: { id_pengaduan: pengaduanIds.map((item) => item.id_pengaduan) }, // Menghapus berdasarkan array id_pengaduan
      transaction,
    });

    // Menghapus data Pengaduan yang memiliki NIK yang sesuai dengan NIK Masyarakat yang akan dihapus
    await Pengaduan.destroy({
      where: { nik },
      transaction,
    });

    // Menghapus data Masyarakat berdasarkan NIK-nya
    const deletedRowCount = await Masyarakat.destroy({
      where: { nik },
      transaction,
    });

    // Commit transaksi jika semua operasi berhasil
    await transaction.commit();

    if (deletedRowCount === 0) {
      // Jika data tidak ditemukan, kirim respons 404
      return res.status(404).json({
        msg: "Data with the provided NIK not found.",
      });
    }

    res.status(200).json({
      msg: "Data Deleted Successfully",
    });
  } catch (error) {
    console.error(error);

    if (transaction) {
      // Rollback transaksi jika terjadi kesalahan
      await transaction.rollback();
    }

    res.status(500).json({
      error: "Terjadi kesalahan dalam menghapus data masyarakat.",
    });
  }
};
