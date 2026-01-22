const mongoose = require("mongoose");

//Validar si un ID es un ObjectId de MongoDB
const validarObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  validarObjectId,
};