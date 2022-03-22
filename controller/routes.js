const express = require('express');
const router = express.Router();
const user = require('../model/user');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
require('./passportLocal')(passport);

function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    }
    else{
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/');
    }
}
router.get('/', (req, res) => {
    if(req.isAuthenticated()){
        res.render("index", { logged : true });
    }
    else{
        res.render("index", { logged : false });
    }
});

router.get('/login', (req, res) => {
    res.render("login", { csrfToken : req.csrfToken() });
});

router.get('/signup', (req, res) => {
    res.render("signup", { csrfToken : req.csrfToken() });
});

router.post('/signup', (req, res) => {
    //get all the values
    const { email, username, password, confirmpassword } = req.body;
    //check if they are empty
    if(!email || !username || !password || !confirmpassword){
        res.render("signup", { err : "All Fields Required !" , csrfToken : req.csrfToken() });
    }
    else if(password != confirmpassword){
        res.render("signup", { err : "Passwords Dont Match !" , csrfToken : req.csrfToken() });
    }
    else{
        //validate email, username and password
        //skipping validation, password strength
        
        //check if a user exists
        user.findOne({ $or : [{ email : email } , { username : username }] }, function (err, data)         
        {
            if(err) throw err;
            if(data){
                res.render("signup", { err : "User Exists, Try Logging In !" , csrfToken : req.csrfToken() });
            }
            else{
                //generate a salt
                bcryptjs.genSalt(12, (err, salt) => {
                    if(err) throw err;
                    //hash the password
                    bcryptjs.hash(password, salt, (err, hash) => {
                        if(err) throw err;
                        //save user in db
                        user({
                            username : username,
                            email : email,
                            password : hash,
                            googleId : null,
                            provider : 'email',
                        }).save((err, data) => {
                            if(err) throw err;
                            //login the user (It is a good pratice to directly login the user after a successful signup)
                            //redirect if u dont want to login
                            res.redirect('/login');
                        });
                    })
                });
            }
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect : '/login',
        successRedirect : '/profile',
        failureFlash : true,
    })(req, res, next);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(function (err){
        res.redirect('/');
    });
});


//Only if a user is authenticated, them only they can visit this route
router.get('/profile', checkAuth, (req, res) => {
    // adding a new parameter for checking verification
    res.render('profile', { username : req.user.username, verified : req.user.isVerified });
  
});

module.exports = router;