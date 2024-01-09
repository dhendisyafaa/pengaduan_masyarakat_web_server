import Pengaduan from "../models/pengaduanModel.js";
import Tanggapan from "../models/tanggapanModel.js";

// Mengambil seluruh data Tanggapan
export const getTanggapan = async (req, res) => {
  try {
    const tanggapan = await Tanggapan.findAll();

    if (!tanggapan || tanggapan.length === 0) {
      return res.json({
        error: "No Tanggapan found.",
      });
    }

    // Ambil data pengaduan untuk setiap tanggapan
    const tanggapanWithPengaduan = await Promise.all(
      tanggapan.map(async (tanggapanItem) => {
        const pengaduan = await Pengaduan.findByPk(tanggapanItem.id_pengaduan);
        return {
          ...tanggapanItem.toJSON(),
          pengaduan: pengaduan ? pengaduan.toJSON() : null,
        };
      })
    );

    res.json(tanggapanWithPengaduan);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam mengambil data tanggapan.",
    });
  }
};

// Mengambil data berdasarkan Id
export const getTanggapanById = async (req, res) => {
  try {
    const idTanggapan = req.params.id;

    const tanggapan = await Tanggapan.findByPk(idTanggapan);

    if (!tanggapan) {
      return res.status(404).json({
        msg: "Tanggapan not found for the provided ID.",
      });
    }

    res.json(tanggapan);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam mengambil data tanggapan.",
    });
  }
};

// Mengambil data tanggapan berdasarkan id_pengaduan
export const getTanggapanByIdPengaduan = async (req, res) => {
  try {
    const idPengaduan = req.params.id_pengaduan;

    if (!idPengaduan) {
      return res.status(400).json({
        error: "Parameter 'id_pengaduan' is required.",
      });
    }

    const tanggapan = await Tanggapan.findAll({
      where: {
        id_pengaduan: idPengaduan,
      },
    });

    if (!tanggapan || tanggapan.length === 0) {
      return res.status(404).json({
        error: "No Tanggapan found for the specified id_pengaduan.",
      });
    }

    res.json(tanggapan);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan dalam mengambil data tanggapan.",
    });
  }
};

// Create data baru
export const createTanggapan = async (req, res) => {
  try {
    // Ambil data dari permintaan
    const { id_pengaduan, id_petugas, tanggapan, status } = req.body;

    // Validasi input
    const requiredFields = [
      "id_pengaduan",
      "id_petugas",
      "tanggapan",
      "status",
    ];
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ msg: `Bidang ${missingFields.join(", ")} harus diisi.` });
    }

    // Cek apakah pengaduan dengan id_pengaduan tersedia
    const pengaduan = await Pengaduan.findByPk(id_pengaduan);

    if (!pengaduan) {
      return res.status(404).json({ msg: "Pengaduan tidak ditemukan." });
    }

    // Cek apakah pengaduan masih dalam status "perlu tanggapan"
    if (
      pengaduan.status !== "perlu tanggapan" &&
      pengaduan.status !== "proses"
    ) {
      return res
        .status(400)
        .json({ msg: "Pengaduan sudah tidak bisa menerima tanggapan." });
    }

    // Validasi status_pengaduan
    if (status !== "proses" && status !== "selesai") {
      return res
        .status(400)
        .json({
          msg: "Status tanggapan harus berupa 'proses' atau 'selesai'.",
        });
    }

    // Proses pembuatan tanggapan
    const createdTanggapan = await Tanggapan.create({
      id_pengaduan,
      id_petugas,
      tanggapan,
      status,
    });

    res
      .status(201)
      .json({
        msg: "Tanggapan Created Successfully",
        tanggapan: createdTanggapan,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam membuat tanggapan." });
  }
};

// Update Tanggapan
export const updateTanggapan = async (req, res) => {
  try {
    const idTanggapan = req.params.id_tanggapan;
    const resIdTanggapan = await Tanggapan.findByPk(idTanggapan);

    if (!resIdTanggapan) {
      return res.status(404).json({ message: "ID Tanggapan not found" });
    }

    const { tanggapan } = req.body;

    const updateTanggapan = { tanggapan };

    await Tanggapan.update(updateTanggapan, {
      where: { id_tanggapan: idTanggapan },
    });

    return res.status(200).json({
      message: "Tanggapan updated successfully",
      response: updateTanggapan,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam memperbarui tanggapan." });
  }
};

// Delete Tanggapan
export const deleteTanggapan = async (req, res) => {
  try {
    const { id_tanggapan } = req.params;

    // Cek apakah tanggapan dengan id_tanggapan tersedia
    const tanggapanToDelete = await Tanggapan.findByPk(id_tanggapan);

    if (!tanggapanToDelete) {
      return res.status(404).json({ msg: "Tanggapan tidak ditemukan." });
    }

    const id_pengaduan = tanggapanToDelete.id_pengaduan;

    // Hapus tanggapan
    await tanggapanToDelete.destroy();

    // Atur ulang status pengaduan
    const pengaduanToUpdate = await Pengaduan.findByPk(id_pengaduan);

    // Cek apakah masih ada tanggapan lain terkait dengan pengaduan tersebut
    const remainingTanggapan = await Tanggapan.findOne({
      where: {
        id_pengaduan,
      },
    });

    // Jika tidak ada tanggapan lain, reset status pengaduan menjadi 'perlu tanggapan'
    if (!remainingTanggapan) {
      pengaduanToUpdate.status = "perlu tanggapan";
    } else {
      // Jika ada tanggapan, cek apakah ada yang 'selesai'
      const selesaiTanggapan = await Tanggapan.findOne({
        where: {
          id_pengaduan,
          status: "selesai",
        },
      });

      if (selesaiTanggapan) {
        pengaduanToUpdate.status = "selesai";
      } else {
        // Jika tidak ada 'selesai', cek apakah ada yang 'proses'
        const prosesTanggapan = await Tanggapan.findOne({
          where: {
            id_pengaduan,
            status: "proses",
          },
        });

        if (prosesTanggapan) {
          pengaduanToUpdate.status = "proses";
        } else {
          // Jika tidak ada 'proses', atur ke 'perlu tanggapan'
          pengaduanToUpdate.status = "perlu tanggapan";
        }
      }
    }

    await pengaduanToUpdate.save();

    res.status(200).json({ msg: "Tanggapan Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam menghapus tanggapan." });
  }
};
