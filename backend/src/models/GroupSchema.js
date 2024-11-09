import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    groupCode : {
        type : String
    },
    groupPassword : {
        type : String
    }
})

const Group = mongoose.model("Group",groupSchema);

export default Group;