import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Pengaduan from "./pengaduanModel.js";

const { DataTypes } = Sequelize;

const Tanggapan = db.define(
  "tanggapan",
  {
    id_tanggapan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_petugas: DataTypes.STRING,
    id_pengaduan: DataTypes.INTEGER,
    tgl_tanggapan: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    tanggapan: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("proses", "selesai"),
    },
  },
  {
    freezeTableName: true,
  }
);

Tanggapan.afterCreate(async (tanggapan, options) => {
  const pengaduan = await Pengaduan.findByPk(tanggapan.id_pengaduan);
  pengaduan.status = tanggapan.status;
  await pengaduan.save();
});

export default Tanggapan;

(async () => {
  await db.sync();
})();
