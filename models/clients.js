var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var clientsSchema = new Schema({
  nombre: { type: String },
  apellidos: { type: String },
  correo: { type: String },
  telefono: { type: String },
  codigo_Acceso: { type: String, unique: true },
  photos_marker: { type: String },
  status: { type: String, default: "Pendiente" },
  servicio: { type: Schema.Types.ObjectId, ref: "Services" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  created_At: { type: Date }
});

module.exports = mongoose.model("Clients", clientsSchema);
