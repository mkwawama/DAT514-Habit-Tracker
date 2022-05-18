// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserHabitSchema = new Schema({
    habitid: {type: String, required:true},
    priorityid: {type: String, required:true},
    userid: {type: String, required:true},
    added_date: {type:Date, default:Date.now},
    completed_date: {type:Date, default:Date.now},
    completed:{type:String, default:'0'},
});


// export userhabit schema
 module.exports = mongoose.model("UserHabit", UserHabitSchema);