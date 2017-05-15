// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the store model
var Store            = require('../app/models/store');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the store for the session
    passport.serializeUser(function(store, done) {
        done(null, store.id);
    });

    // used to deserialize the store
    passport.deserializeUser(function(id, done) {
        Store.findById(id, function(err, store) {
            done(err, store);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose name is the same as the forms name
        // we are checking to see if the user trying to login already exists
        Store.findOne({ 'name' :  name }, function(err, store) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that name
            if (store) {
                return done(null, false, req.flash('signupMessage', 'That name is already taken.'));
            } else {

                // if there is no user with that name
                // create the user
                var newStore            = new Store();

                // set the user's local credentials
                newStore.name    = name;
                newStore.password = newStore.generateHash(password);
                newStore.full_name = req.body.full_name;
                newStore.korean_name = req.body.korean_name;
                newStore.image = req.body.image;
                newStore.color = req.body.color;

                // save the user
                newStore.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newStore);
                });
            }

        });    

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with name
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, name, password, done) { // callback with name and password from our form

        // find a user whose name is the same as the forms name
        // we are checking to see if the user trying to login already exists
        Store.findOne({ 'name' :  name }, function(err, store) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!store)
                return done(null, false, req.flash('loginMessage', 'No store found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!store.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, store);
        });

    }));
};