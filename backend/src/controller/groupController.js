import Group from "../models/GroupSchema.js";
import { isLoggedIn } from "../utils/authorization.js";

export const joinGroup = async (req, res) => {

    if (!(await isLoggedIn(req))) {
        res.status(503).send({ success: false, reason: "Unauthorized" });
        return;
    }

    const groupCode = req.body.groupCode;
    const passphrase = req.body.groupPassword;

    if (await Group.exists({ groupCode })) {
        const group_ref = await Group.findOne({ groupCode });
        if (passphrase === group_ref.groupPassword) {
            res.status(200).send({ groupToken: group_ref._id, expires: "never" });
        }
        else {
            res.status(503).send({ success: false, reason: "The passphrase for the group is wrong or group code is taken" });
        }
    }
    else {
        try {
            const group = await Group.create({
                groupCode: groupCode,
                groupPassword: passphrase
            });
            res.status(200).send({ created: true, groupToken: group._id, expires: "never" });
        }
        catch {
            res.status(500).send({ success: false, reason: "Group name is taken" });
        }
    }
} 