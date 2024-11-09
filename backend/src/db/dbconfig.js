import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL,{
    autoIndex : true,
    dbName : "final_project"
});