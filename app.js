if (process.env.NODE_ENV !== "production"){
	require('dotenv').config();
}
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const User = require("./models/user");
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');

const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DATABASEURL;

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database Connected!")
});

const app = express();

const commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index")


//PASSPORT CONFIGURATION

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
	url: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(mongoSanitize({
	replaceWith: '_'
}))




app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("App is running on the YelpCamp server");
})