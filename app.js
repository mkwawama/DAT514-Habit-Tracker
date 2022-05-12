var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	Habit =  require("./models/habit"),
	Priority =  require("./models/priority"),
	User = require("./models/user");


mongoose.connect("mongodb+srv://habbit:habbit2022@cluster0.qicx3.mongodb.net/habittracker?retryWrites=true&w=majority");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("express-session")({
	secret: "Rusty is a dog",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// ROUTES
//=====================

// Showing start fpage
app.get("/", function (req, res) {
	res.render("start");
});

// Showing home page
app.get("/homepage", isLoggedIn, function (req, res) {
	var prts;
	Priority.find({}, function(err, priorities) {   //load habits from habit schema
		if (err)
		  console.log(err);
		  console.log(priorities);
		prts = priorities;
	  });

	Habit.find({}, function(err, habits) {   //load habits from habit schema
		if (err)
		  console.log(err);
		res.render("homepage",{habits:habits,priorities:prts});  // send list of habits to homepage
	  });
});

// Showing register form
app.get("/register", function (req, res) {
	res.render("register");
});

// Handling user signup
app.post("/register", function (req, res) {
	console.log(req.body);
	var email = req.body.email;
	var username = email;
	var password = req.body.password;
	var fullname = req.body.fullname;
	User.register(new User({ username: username, fullname:fullname }),
			password, function (err, user) {
		if (err) {
			console.log(err);
			return res.render("register");
		}

		//passport.authenticate("local")(
			//req, res, function () {
			res.render("login");
		//});
	});
});

//Showing login form
app.get("/login", function (req, res) {
	res.render("login");
});

//Handling user login
app.post("/login", passport.authenticate("local", {
	successRedirect: "/homepage",
	failureRedirect: "/login"
}), function (req, res) {
	if (err){
		console.log(err);
	}
});

//Handling user logout
app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect("/login");
}

var port = process.env.PORT || 8000;
app.listen(port, function () {
	console.log("Habit server has Started at port "+port);
});

