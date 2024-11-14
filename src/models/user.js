const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const UserModel = mongoose.model('Usuario', UserSchema);

module.exports = UserModel;