const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestarauntSchema = new Schema({

    name:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 8
    },
    logo: {
        type: String
    },
    rating: {
        type: Number
    },
    dishes: [{
        type: Schema.Types.ObjectId,
        ref: 'items'
    }],
    isVerified: {
        type: Boolean,
        default: false
    }

}, {usePushEach: true});

module.exports = mongoose.model('Restaraunt', RestarauntSchema);