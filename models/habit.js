// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var HabitSchema = new Schema({
    habit: {type: String, required:true, unique:true},
});


// export habitschema
 module.exports = mongoose.model("Habit", HabitSchema);
