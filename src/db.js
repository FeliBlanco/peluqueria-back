const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("BASE DE DATOS CONECTADA")
    }
    catch(err) {
        console.log("ERROR AL CONECTAR BASE DE DATOS")
        console.log(err)
    }
}

module.exports = connectDB