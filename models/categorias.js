var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categoriasSchema = new Schema({
		nombre: {type:String, unique: true},
		nombreFoto: { type: String },
		informacion: { type: String }
});

module.exports = mongoose.model('Categorias', categoriasSchema);
