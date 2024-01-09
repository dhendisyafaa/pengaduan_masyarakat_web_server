import Pengaduan from "../models/pengaduanModel.js";
import path from "path";
import fs from "fs"; // file sistem
import { v4 as uuidv4 } from "uuid";
import Tanggapan from "../models/tanggapanModel.js";
import Masyarakat from "../models/masyarakatModel.js";
import { formatDistanceToNow } from "date-fns";

// Mengambil seluruh data Pengaduan
export const getPengaduan = async (req, res) => {
  try {
    const pengaduan = await Pengaduan.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (!pengaduan || pengaduan.length === 0) {
      return res.json({
        msg: "No Pengaduan found.",
      });
    }

    const formattedPengaduan = pengaduan.map((item) => {
      const distanceToNow = formatDistanceToNow(new Date(item.createdAt), {
        addSuffix: true,
      });

      return {
        id_pengaduan: item.id_pengaduan,
        tgl_pengaduan: item.tgl_pengaduan,
        nik: item.nik,
        isi_laporan: item.isi_laporan,
        image: item.image,
        url: item.url,
        status: item.status,
        createdAt: distanceToNow,
        updatedAt: item.updatedAt,
      };
    });

    res.json(formattedPengaduan);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam mengambil data pengaduan.",
    });
  }
};

// Mengambil data berdasarkan ID
export const getPengaduanById = async (req, res) => {
  try {
    const idPengaduan = req.params.idPengaduan;

    const pengaduan = await Pengaduan.findByPk(idPengaduan, {
      include: [
        {
          model: Tanggapan, // Sesuaikan dengan nama model tanggapan yang digunakan
          as: "memiliki_tanggapan", // Sesuaikan dengan alias yang telah Anda tentukan
        },
      ],
    });

    if (!pengaduan) {
      return res.status(404).json({
        msg: "Pengaduan not found for the provided ID.",
      });
    }

    res.json(pengaduan);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam mengambil data pengaduan.",
    });
  }
};

// Mengambil data pengaduan berdasarkan NIK
export const getPengaduanByNIK = async (req, res) => {
  const nik = req.params.nik;

  try {
    const pengaduan = await Pengaduan.findAll({
      where: {
        nik: nik,
      },
    });

    if (!pengaduan || pengaduan.length === 0) {
      return res
        .status(404)
        .json({ message: "Pengaduan tidak ditemukan untuk nik ini" });
    }

    res.json(pengaduan);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Create data Pengaduan
export const createPengaduan = async (req, res) => {
  console.log("req", req.file);
  try {
    // Destructure data dari permintaan
    const { nik, isi_laporan } = req.body;

    // Validasi input
    if (!nik || !isi_laporan) {
      return res.status(400).json({ msg: "Semua bidang harus diisi." });
    }

    // Validasi file
    if (!req.files || !req.files.image) {
      return res.status(400).json({ msg: "Tidak ada file yang diunggah." });
    }

    const file = req.files.image;
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg"];

    if (!allowedExtensions.includes(ext)) {
      return res
        .status(422)
        .json({ msg: "File gambar harus berformat PNG, JPG, atau JPEG." });
    }

    const maxSize = 5 * 1024 * 1024; // Ukuran file maksimum adalah 5MB

    if (file.size > maxSize) {
      return res
        .status(422)
        .json({ msg: "Ukuran file gambar harus kurang dari 5MB." });
    }

    const fileName = `${uuidv4()}${ext}`;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    // Validasi apakah NIK ada dalam tabel Masyarakat
    const masyarakat = await Masyarakat.findOne({ where: { nik } });

    if (!masyarakat) {
      return res
        .status(404)
        .json({ msg: "NIK tidak ditemukan dalam tabel Masyarakat." });
    }

    // Pindahkan file ke direktori yang sesuai
    file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Terjadi kesalahan dalam mengunggah file." });
      }

      // Simpan pengaduan ke database
      try {
        const pengaduan = await Pengaduan.create({
          nik,
          isi_laporan,
          image: fileName,
          url,
        });

        // Berhasil tersimpan
        res
          .status(201)
          .json({ msg: "Pengaduan Created Successfully", pengaduan });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Terjadi kesalahan dalam menyimpan pengaduan." });
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam mengunggah pengaduan." });
  }
};

// Update Pengaduan
export const updatePengaduan = async (req, res) => {
  try {
    const pengaduan = await Pengaduan.findByPk(req.params.id);

    if (!pengaduan) {
      return res.status(404).json({ msg: "Pengaduan not found" });
    }

    // Validasi input: Pastikan tidak ada yang mencoba mengubah 'nik'
    if (req.body.hasOwnProperty("nik")) {
      return res.status(400).json({ error: "NIK cannot be updated" });
    }

    let fileName = pengaduan.image;

    if (req.files && req.files.image) {
      const file = req.files.image;
      const ext = path.extname(file.name).toLowerCase();
      const allowedType = [".png", ".jpg", ".jpeg"];

      if (!allowedType.includes(ext)) {
        return res.status(422).json({ msg: "Invalid Image" });
      }

      const maxSize = 5 * 1024 * 1024; // Ukuran file maksimum adalah 5MB
      if (file.size > maxSize) {
        return res.status(422).json({ msg: "Image must be less than 5MB" });
      }

      const filePath = `./public/images/${pengaduan.image}`;

      try {
        // Hapus gambar lama
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(error);
      }

      fileName = `${uuidv4()}${ext}`;

      file.mv(`./public/images/${fileName}`, (err) => {
        if (err) {
          return res.status(500).json({ msg: err.message });
        }
      });
    }

    const { isi_laporan, status } = req.body;

    // Perbarui URL berdasarkan nama file yang baru
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    await pengaduan.update({
      isi_laporan,
      image: fileName,
      status,
      url, // Perbarui URL
    });

    res.status(200).json({ msg: "Pengaduan Updated Successfully" });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam memperbarui pengaduan." });
  }
};

// Delete Pengaduan
export const deletePengaduan = async (req, res) => {
  try {
    const pengaduan = await Pengaduan.findByPk(req.params.id);

    if (!pengaduan) {
      return res.status(404).json({ msg: "Pengaduan not found" });
    }

    // Pastikan ada gambar sebelum mencoba menghapusnya
    if (pengaduan.image) {
      const filePath = `./public/images/${pengaduan.image}`;

      // Hapus gambar
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Hapus pengaduan
    await pengaduan.destroy();

    res.status(200).json({ msg: "Pengaduan Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting pengaduan:", error.message);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam menghapus pengaduan." });
  }
};
