import User from "../models/UserSchema.js";
import { generateRandomSalt, hashPassword } from "../utils/passwordHandle.js";

export const registerUser = async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    const salt = generateRandomSalt();
    const hashed_password = await hashPassword(password,salt);
    try {
        await User.create({
            "email" : email,
            "password" : hashed_password,
            "salt" : salt
        }) 
        res.status(200).send({success : true});
    }
    catch {
        res.status(500).send({success : false , reason : "This email is already registered"})
    }
} 

export const loginUser = async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    if(await User.exists({email : email})) {
        const user_ref = await User.findOne({"email" : email});
        const salt = user_ref.salt;
        const hashed_password = await hashPassword(password,salt);
        if(hashed_password === user_ref.password) {
            res.status(200).send({accessToken : user_ref._id , expires : "never"});
        }
        else {
            res.status(503).send({success : false , reason : "Authorization failed"});
        }
    }
    else {
        res.status(404).send({success : false , reason : "The provided email address doesn't exists"});
    }
} 