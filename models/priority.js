// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PrioritySchema = new Schema({
    priority: {type: String, required:true, unique:true},
    score: {type: String, required:true, unique:true},
});


// export priorityschema
 module.exports = mongoose.model("Priority", PrioritySchema);
