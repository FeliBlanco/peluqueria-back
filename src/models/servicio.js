const mongoose = require('mongoose');


const ServicioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required:true
    },
    precio: {
        type: Number
    },
    duracion: {
        type: Number
    },
    fechas: [
        {
            fecha: {
                type: String
            },
            dia_semana: {
                type: Number
            },
            repite: {
                type: Boolean
            },
            horarios: [
                {
                    desde: {
                        type: String
                    },
                    hasta: {
                        type: String
                    }
                }
            ]
        }
    ]
},{
    timestamps: true
})

const ServicioModel = mongoose.model('Servicio', ServicioSchema);

module.exports = ServicioModel;