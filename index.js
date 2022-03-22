const express = require('express');
const mongoose = require('mongoose');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
var MemoryStore = require('memorystore')(expressSession);
const passport = require('passport');
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views',);

app.use(express.urlencoded({ extended: true }));

const mongoURI = require('./config/mongoKEY');
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, }).then(() => console.log("Connected !"),);

app.use(cookieParser('random'));

app.use(expressSession({
    secret: "random",
    resave : true,
    saveUninitialized : true,
    maxAge : 24*60*60*1000,
    //By default Express session uses memory store which in turn is not suitable for production
    //It is made particularly for development so there can be chances of memory leakage 
    store: new MemoryStore(),
}));

app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Custom Middleware 
app.use(function (req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
})

app.use(require('./controller/routes.js'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("Server Started at " + PORT));
