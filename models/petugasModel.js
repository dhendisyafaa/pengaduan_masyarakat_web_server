import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Tanggapan from "./tanggapanModel.js";

const { DataTypes } = Sequelize;

const Petugas = db.define(
  "petugas",
  {
    id_petugas: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      primaryKey: true,
    },
    nama_petugas: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    telp: DataTypes.CHAR,
    level: DataTypes.ENUM("admin", "petugas"),
  },
  {
    freezeTableName: true,
  }
);

Petugas.hasMany(Tanggapan, { foreignKey: "id_petugas" });

export default Petugas;

(async () => {
  await db.sync();
})();
