const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    email:{
        type: String,
        required: true,
        minlength: 4
    },
    vkID: {
        type: Number
    },
    facebookID: {
        type: Number
    },
    googleID: {
        type: Number
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String
    },
    password:{
        type: String,
        minlength: 8
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifyCode: {
        type: String
    }

});

module.exports = mongoose.model('User', UserSchema);