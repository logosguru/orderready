// app/routes.js
module.exports = function(app, passport, moment) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home',
        failureRedirect : '/',
        failureFlash : true
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // =====================================
    // HOME SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/home', isLoggedIn, function(req, res) {
        var start = new Date();
        start.setHours(0,0,0,0);
        var end = new Date();
        end.setHours(23,59,59,999);

        var Order = require('../app/models/order');
        Order.find({
            store_name : req.user.name,
            date_created : {
                $gte: start,
                $lt: end
            }
        }).sort({
            "date_created": 1
        }).exec(function(err, orders) {
            if (err)
                return console.log(err);
            res.render('home.ejs', {
                store : req.user, // get the user out of session and pass to template
                orders : orders,
                moment : moment,
                message: req.flash('orderMessage')
            });
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.post('/ready', isLoggedIn, (req, res) => {
        var Order = require('../app/models/order');
        Order.findOne({ 'store_name' :  req.body.store_name, 'order_no' : req.body.order_no }, function(err, order) {
            if (err)
                return console.log(err);
            if (order) {
                return req.flash('orderMessage', 'That order number is already existing!');
            }
            else {
                var newOrder            = new Order();
                newOrder.store_name = req.body.store_name;
                newOrder.order_no = req.body.order_no;
                newOrder.save(function(err) {
                    if (err)
                        return req.flash('orderMessage','Fail to save order. Please try again.');
                });
            }
            res.redirect('/home');
        });
    });

    app.delete('/home', (req, res) => {
        var Order = require('../app/models/order');
        Order.findOneAndRemove({
            _id: req.body.id
        }, (err, result) => {
            if (err) return req.flash('orderMessage', 'Fail to delete order. Please refresh the page and try again.');
            else
                return res.json('Deleted successfully');
        })
    })
};




// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
