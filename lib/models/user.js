'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    color: {
        type: String,
        enum: ['red', 'green', 'blue']
    },
    enabled: {
        type: Boolean,
        default: true
    },
    userInformation: {
        type: Schema.Types.ObjectId,
        ref: 'UserInformation',
        required: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address' // Asegúrate de que 'Address' es el nombre correcto del modelo relacionado
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
