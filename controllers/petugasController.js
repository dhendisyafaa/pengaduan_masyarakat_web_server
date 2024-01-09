import Petugas from "../models/petugasModel.js";
import Tanggapan from "../models/tanggapanModel.js";

// Mengambil seluruh data Petugas
export const getPetugas = async (req, res) => {
  try {
    const petugas = await Petugas.findAll();

    if (!petugas) {
      return res.json({ msg: "No Petugas found." });
    }

    res.json(petugas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam mengambil data petugas." });
  }
};

// Mengambil data Petugas berdasarkan id_petugas
export const getPetugasById = async (req, res) => {
  try {
    const idPetugas = req.params.id_petugas;

    // Menggunakan include untuk mengambil data Tanggapan yang terkait dengan Petugas
    const petugas = await Petugas.findByPk(idPetugas, {
      include: Tanggapan,
    });

    if (!petugas) {
      return res
        .status(404)
        .json({ msg: "Petugas not found for the provided ID." });
    }

    res.json(petugas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam mengambil data petugas." });
  }
};

// Create data tabel Petugas
export const createPetugas = async (req, res) => {
  try {
    // Validasi input (pastikan semua bidang yang diperlukan diisi)
    const { id_petugas, nama_petugas, username, password, telp, level } =
      req.body;
    if (
      // !id_petugas ||
      !nama_petugas ||
      !username ||
      !password ||
      !telp ||
      !level
    ) {
      return res.status(400).json({ error: "Semua bidang harus diisi." });
    }

    // Simpan data Petugas ke database menggunakan method create
    const petugas = await Petugas.create({
      id_petugas,
      nama_petugas,
      username,
      password,
      telp,
      level,
    });

    res.status(201).json({
      msg: "Petugas saved successfully",
      petugas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam menyimpan data petugas.",
    });
  }
};

// Update Petugas
export const updatePetugas = async (req, res) => {
  try {
    const idPetugas = req.params.id_petugas;
    const petugas = await Petugas.findOne({
      where: {
        id_petugas: idPetugas,
      },
    });

    if (!petugas) {
      return res.status(404).json({
        msg: "Petugas not found for the provided ID.",
      });
    }

    const updates = req.body; // Menggunakan seluruh body sebagai objek update

    // Validasi input: Pastikan tidak ada yang mencoba mengubah 'id_petugas'
    if (updates.hasOwnProperty("id_petugas")) {
      return res.status(400).json({
        error: "ID Petugas cannot be updated",
      });
    }

    // Periksa setiap atribut dalam data yang ingin Anda perbarui
    // Jika atribut dalam data yang ingin Anda perbarui kosong, maka gunakan nilai atribut dari data entitas yang ada di database
    if (!updates.nama) {
      updates.nama = petugas.nama;
    }

    if (!updates.username) {
      updates.username = petugas.username;
    }

    if (!updates.password) {
      updates.password = petugas.password;
    }

    if (!updates.telp) {
      updates.telp = petugas.telp;
    }

    // Melakukan update langsung ke database berdasarkan ID
    const [updatedRowCount] = await Petugas.update(updates, {
      where: {
        id_petugas: idPetugas,
      },
    });

    if (updatedRowCount === 0) {
      return res.status(404).json({
        msg: "Petugas not found",
      });
    }

    res.status(200).json({
      msg: "Petugas updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam memperbarui data petugas.",
    });
  }
};

// Delete petugas
export const deletePetugas = async (req, res) => {
  try {
    const id_petugas = req.params.id_petugas; // Menggunakan 'id_petugas' sebagai nama variabel

    const deletedRowCount = await Petugas.destroy({
      where: {
        id_petugas: id_petugas, // Menggunakan 'id_petugas' untuk menghapus berdasarkan ID
      },
    });

    if (deletedRowCount === 0) {
      return res.status(404).json({
        msg: "Data with the provided ID not found.",
      });
    }

    res.status(200).json({
      msg: "Petugas Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam menghapus data petugas.",
    });
  }
};
