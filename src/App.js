const express = require('express');
const cors = require('cors');
const connectDB = require('./db');


const app = express();

connectDB()

app.use(cors());
app.use(express.json());


app.use('/servicio', require('./routes/servicio.js'))
app.use('/usuario', require('./routes/usuario.js'))


module.exports = app;