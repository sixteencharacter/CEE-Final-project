import mongoose from "mongoose";
import Group from "./GroupSchema.js";

const todoSchema = new mongoose.Schema({
    title : {
        type : String
    },
    description : {
        type : String
    },
    dueDate : {
        type : Date
    },
    startDate : {
        type : Date
    },
    tags : [String] ,
    status : {
        type : String
    },
    group : Group.schema
})

const Todo = mongoose.model("Todo",todoSchema);

export default Todo;