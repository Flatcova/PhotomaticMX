var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categoriasSchema = new Schema({
		nombre: {type:String, unique: true},
		urlPhoto: { type: String },
		informacion: { type: String },
    linkCategoria: {type:String, unique: true}
});

module.exports = mongoose.model('Categorias', categoriasSchema);
