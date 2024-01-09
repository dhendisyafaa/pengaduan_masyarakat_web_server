import { Sequelize } from "sequelize"; // Modul untuk berinteraksi dengan database
import bcrypt from "bcrypt"; // Untuk hashing password

// Import file konfigurasi database
import db from "../config/database.js";
import Pengaduan from "./pengaduanModel.js";

// Definisikan model Masyarakat
const { DataTypes } = Sequelize;
const Masyarakat = db.define(
  "masyarakat",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true, // Pastikan UUID tidak boleh kosong
      },
    },
    nik: {
      type: DataTypes.CHAR,
      primaryKey: true, // Nik digunakan sebagai kunci utama
    },
    nama: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    telp: DataTypes.CHAR,
  },
  {
    freezeTableName: true,
  }
);

// Definisi relasi antara Masyarakat dan Tanggapan
Masyarakat.hasMany(Pengaduan, {
  foreignKey: "nik",
  as: "memiliki_pengaduan",
  onDelete: "CASCADE",
});

// Hash password sebelum membuat akun Masyarakat
Masyarakat.beforeCreate(async (masyarakat) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(masyarakat.password, saltRounds);
  masyarakat.password = hashedPassword;
});

export default Masyarakat;

(async () => {
  await db.sync();
})();
