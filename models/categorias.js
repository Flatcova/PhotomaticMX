var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var categoriasSchema = new Schema({
  titulo: { type: String, unique: true },
  s3_name: { type: String, unique: true },
  descripcion: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  created_At: { type: Date },
  img_name: { type: String }
});

module.exports = mongoose.model("Categorias", categoriasSchema);
