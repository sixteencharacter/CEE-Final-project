import express from "express";
import { joinGroup } from "../controller/groupController.js";

const router = express.Router();

router.post("/join",joinGroup);

export default router;