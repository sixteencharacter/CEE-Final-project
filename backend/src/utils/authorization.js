import Group from "../models/GroupSchema.js";
import User from "../models/UserSchema.js";

export const isLoggedIn = async (req) => {
    if (req.headers.authorization === null) {
        return false;
    }
    try {
        const accessToken = String(req.headers.authorization).split(" ")[1].trim();
        const exists = await User.exists({ _id: accessToken });
        return exists;
    }
    catch {
        return false
    }
};

export const isAllConfigured = async (req) => {
    if (req.headers.authorization === null) {
        return false;
    }
    try {
        const [userToken, groupToken] = String(req.headers.authorization).split(" ")[1].split("+");
        const user_exists = await User.exists({ _id: userToken });
        const group_exists = await Group.exists({ _id: groupToken });
        return user_exists && group_exists;
    }
    catch {
        return false
    }
};

export const getGroupId = (req) => {
    const [userToken, groupToken] = String(req.headers.authorization).split(" ")[1].split("+");
    return groupToken;
}