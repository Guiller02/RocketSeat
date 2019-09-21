const mongoose = require("../../db/db");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  project:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'
  },
  assignedTo:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:true
  },
  completed:{
      type: Boolean,
      required: true,
      default:false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
