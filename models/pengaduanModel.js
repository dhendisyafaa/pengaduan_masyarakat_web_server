import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Tanggapan from "./tanggapanModel.js";

const { DataTypes } = Sequelize;

const Pengaduan = db.define(
  "pengaduan",
  {
    id_pengaduan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tgl_pengaduan: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    nik: DataTypes.CHAR,
    isi_laporan: DataTypes.TEXT,
    image: DataTypes.STRING,
    url: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("perlu tanggapan", "proses", "selesai"),
      defaultValue: "perlu tanggapan",
    },
  },
  {
    freezeTableName: true,
  }
);

Pengaduan.hasMany(Tanggapan, {
  foreignKey: "id_pengaduan",
  as: "memiliki_tanggapan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Tanggapan.belongsTo(Pengaduan, {
  foreignKey: "id_pengaduan",
  as: "memiliki_tanggapan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Pengaduan;

(async () => {
  await db.sync();
})();
