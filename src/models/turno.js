const mongoose = require('mongoose');


const TurnoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref:'Usuario'
    },
    servicio: {
        type: mongoose.Types.ObjectId,
        ref:'Servicio'
    },
    fecha: {
        type: String,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
},{
    timestamps: true
})

const TurnoModel = mongoose.model('Turno', TurnoSchema);

module.exports = TurnoModel;