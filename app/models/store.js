var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var storeSchema = mongoose.Schema({
    name: String,
    full_name: String, 
    korean_name: String,
    image: String,
    password: String, 
    color: String
});

// methods ============
// generating a hash
storeSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
storeSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Store', storeSchema);
