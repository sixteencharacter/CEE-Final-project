import express from "express";
import { createNewTodo, deleteTodo, getAnFilter, getTodoById, updateTodo } from "../controller/todoController.js";

const router = express.Router();

router.get("/", getAnFilter);
router.get("/:id", getTodoById);
router.post("/", createNewTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;