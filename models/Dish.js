const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DishSchema = new Schema({

    name:{
        type: String,
        required: true,
        minlength: 4
    },
    slug: {
        type: String
    },
    vegan: {
        type: Boolean,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: {
        type: String
    }

});

module.exports = mongoose.model('Dish', DishSchema);