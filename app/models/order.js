var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
    store: {
        name: String,
        color: String, 
        image: String
    },
    order_no: { type: String, required: true},
    date_created: { type: Date, default: Date.now }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Order', orderSchema);
