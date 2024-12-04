import express from "express";
import cors from "cors";
import UserRouter from "./routes/userRoute.js";
import GroupRouter from "./routes/groupRoute.js";
import TodoRouter from "./routes/TodoRoute.js";

import "./db/dbconfig.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/user", UserRouter);
app.use("/group", GroupRouter);
app.use("/todo", TodoRouter);

export default app;