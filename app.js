const express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	Campground = require("./models/campgrounds"),
	methodOverride = require("method-override"),
	Comment = require("./models/comments"),
	User = require("./models/user"),
	seedDB = require("./seeds");


const commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index")


//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Jackie is still the best dog there is",
	resave: false,
	saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect("mongodb+srv://ammanabua:zKpgEB7LsK13vldH@cluster0.aviee.mongodb.net/yelp_camp?retryWrites=true&w=majority", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(() => {
// 	console.log("Connected to DB!");
// }).catch(err => {
// 	console.log("ERROR:", err.message);
// });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));




app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// seedDB();  //seed the database



app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("App is running on the YelpCamp server");
})