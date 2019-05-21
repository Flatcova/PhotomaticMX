var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var landingSchema = new Schema({
  titulo: { type: String },
  descripcion: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  created_At: { type: Date },
  img_URL: { type: String }
});

module.exports = mongoose.model("Landing", landingSchema);
