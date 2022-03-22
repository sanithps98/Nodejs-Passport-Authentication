const user = require('../model/user');
const bcryptjs = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;

//The function takes passport coming from routes.js
//It does some calculation and returns whatever the result is !
module.exports = function(passport){ 
    //usernameField is email because email-password combination is used here !
    passport.use(new localStrategy({ usernameField : 'email' }, (email, password, done) => { // email, password will come from login route 
        user.findOne({ email : email }, (err, data) => { //If we can find the user, then we have either err or data !
            if(err) throw err;
            if(!data){ //If there is no data
                return done(null, false, { message : "User Doesn't Exist !"});
            }

            // password - Password which user has entered 
            // data.password - Password which we get from database
            bcryptjs.compare(password, data.password, (err, match) => { 
                if(err){
                    return done(null, false);
                }
                if(!match){
                    return done(null, false, { message : "Password Doesn't Match !"});                
                }
                if(match){
                    return done(null, data);                
                }
            })
        })
    }));

    //2 important Passport functions
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        user.findById(id, function(err, user){
            done(err, user);
        })
    });
}