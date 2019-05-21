var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var servicesSchema = new Schema({
  nombre: { type: String },
  precio: { type: String },
  cambios: { type: String },
  ubicaciones: { type: String },
  duracion: { type: String },
  cant_fotos: { type: String },
  info: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  created_At: { type: Date }
});

module.exports = mongoose.model("Services", servicesSchema);
