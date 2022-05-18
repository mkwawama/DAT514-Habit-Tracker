var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	Habit =  require("./models/habit"),
	Priority =  require("./models/priority"),
	UserHabit=  require("./models/userhabit"),
	User = require("./models/user");
const { get } = require("express/lib/response");
const userhabit = require("./models/userhabit");


mongoose.connect("mongodb+srv://habbit:habbit2022@cluster0.qicx3.mongodb.net/habittracker?retryWrites=true&w=majority");
var userData;
var priorities;
var habits;
var weekaveragescore;
var thisDate;   //  from selected calendar date

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("express-session")({
	secret: "DAT514 Habit Tracker",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

getHabits();
getPriorities();

function getHabits(){
	Habit.find({}, function(err, habit) {   //load habits from habit schema
		if (err)
		  console.log(err);
		habits = habit;		
	  });
}

function getPriorities(){ 
	Priority.find({}, function(err, priority) {   //load priorities from priority schema
		if (err)
		  console.log(err);
		priorities = priority;		
	  });
}

function weeklyScore() {	
	var myhabits;	
	var date = new Date();
	var yyyymmdd = date.toISOString().slice(0, 10);
	date.setDate(date.getDate() - 7);  // last seven days
	
	var dailysum=0;  // for summing app all todays completed habits
	  UserHabit.find({userid:userData._id,added_date:{$gte:date}}, function(err, todayHabits) {   //load week habits from userhabit schema
		if (err)
		  console.log(err);
		myhabits = todayHabits;		
		for (i=0;i<myhabits.length;i++){    // go through all week habits
			if (yyyymmdd != myhabits[i].added_date.toISOString().slice(0, 10)){  // exclude today habits				
			for (j=0;j<priorities.length;j++){  // go through priority list to get priority name and score values
					if (myhabits[i].priorityid == priorities[j]._id){  // compare todays priorities with the list of prioritities
						for (k=0;k<habits.length;k++){  // go through a list of habits to get habit names 
							if (myhabits[i].habitid == habits[k]._id){									
								if (myhabits[i].completed == 1)  {
									dailysum = dailysum + parseInt(priorities[j].score);	// total week score for completed habits																														
									
								}
							}
						}																															
					}
			}
		}
		}	
		weekaveragescore =  Math.ceil(dailysum/7);  // week average score rounded up to neatest integer
		console.log(weekaveragescore);	
	  });	  
	  
	}

//=====================
// ROUTES
//=====================

// Showing start page
app.get("/", function (req, res) {
	res.render("start");
});

app.post("/homepage", isLoggedIn, function (req, res) {		 // get submitted datafrom a calendar form
	thisDate = req.body.thisDate;  // assigneg picked data to globa variable thisDate
	res.redirect("/homepage");

});


// Showing home page
app.get("/homepage", isLoggedIn, function (req, res) {	
	weeklyScore();
	var myhabits;	
	var listhabits = [];
	var today = new Date().toISOString().slice(0, 10);  // get YYYY-MM-DD for todays habits
	var dayMidnight = new Date(today.slice(0,10)+"T23:59:59.000Z");  // mid night just before the next date
	
	if (thisDate){  // if user used a calendar ,use this date to get habits
		today = thisDate;
		dayMidnight = new Date(thisDate.slice(0,10)+"T23:59:59.000Z");  // mid night just before the next date
	}
	var dailysum=0;  // for summing app all todays completed habits
	  UserHabit.find({userid:userData._id,added_date:{$gte:today,  $lte:dayMidnight} }, function(err, todayHabits) {   //load today habits from userhabit schema
		if (err)
		  console.log(err);
		myhabits = todayHabits;	//assigned todays habits to global variable myhabits	
		for (i=0;i<myhabits.length;i++){    // go through all todays habits
			for (j=0;j<priorities.length;j++){  // go through priority list to get priority name and score values
					if (myhabits[i].priorityid == priorities[j]._id){  // compare todays priorities with the list of prioritities
						for (k=0;k<habits.length;k++){  // go through a list of habits to get habit names 
							if (myhabits[i].habitid == habits[k]._id){	
								if (myhabits[i].completed == 1)  
									dailysum = dailysum + parseInt(priorities[j].score);	// total daily score for completed habits																						
								var str = '{"id":"'+myhabits[i]._id+'","completed":"'+myhabits[i].completed+'","habit":"'+habits[k].habit+'","priority":"'+priorities[j].priority+'","score":"'+priorities[j].score+'"}';
								var strjson = JSON.parse(str);
								listhabits.push(strjson);
							}
						}																															
					}
			}
		}	
		listhabits.dailysum = dailysum;	// dail sum of score
		listhabits.weekaveragescore = weekaveragescore;	  // week average score
		listhabits.today = today;  // today date
		listhabits.score = dailysum+"|"+weekaveragescore;
		res.render("homepage",{habits:habits,priorities:priorities,listhabits:listhabits,userData});  // pass these parametrs to homepage		
	  });	  

	});

// Showing register form
app.get("/register", function (req, res) {
	res.render("register");
});

// Handling user signup
app.post("/register", function (req, res) {
	
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
			res.render("login");
		
	});
});

// Handling  submitted user habits
app.post("/userhabit", function (req, res) {
	new UserHabit({ priorityid: req.body.priority, userid:req.body.userId,habitid:req.body.habits }).save(function (err, str) {
		if (err) {
				console.log(err);		
		}
});
res.redirect("/homepage");
});

function updateHabit(item){
	console.log(item);
}

// Handling  completed user habits
app.post("/completehabit", function (req, res) {
	if (req.body.habits){		
	var completed = {completed:"1"};
	if (req.body.habits.length == 24){  // only one habit id selected
		// update this habit as completed
		UserHabit.findOneAndUpdate({_id: req.body.habits}, completed, {new: true}, function(err, habits) {
			if (err)
			  console.log(err);				  
		  });
	}
	
	if (req.body.habits.length < 24){  // more than one habit id selected
	for (i=0;i<req.body.habits.length;i++){
		UserHabit.findOneAndUpdate({_id: req.body.habits[i]}, completed, {new: true}, function(err, habits) {
		if (err)
		  console.log(err);
			  
	  });  
	}
	}
	}
	res.redirect("/homepage");
	
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

function isLoggedIn(req, res, next) {  // check if user is logged in
	if (req.isAuthenticated()) {
		userData = req.user;  // get user details to the global variable user Data
		return next();
	}
	res.redirect("/login");
}

var port = process.env.PORT || 8000;
app.listen(port, function () {
	console.log("Habit server has Started at port "+port);
});

