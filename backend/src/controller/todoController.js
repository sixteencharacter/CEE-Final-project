import Todo from "../models/TodoSchema.js";
import Group from "../models/GroupSchema.js";
import { AsianTimeParse, dateSimplifier } from "../utils/datetime.js";
import { getGroupId, isAllConfigured } from "../utils/authorization.js";

export const getAnFilter = async (req, res) => {
    if (!(await isAllConfigured(req))) {
        res.status(503).send({ success: false, reason: "Unauthorized" });
        return;
    }

    try {
        const filter = {};
        if (req.query.title) filter.title = { $regex: ".*" + req.query.title + ".*", $options: "i" };
        if (req.query.status) filter.status = req.query.status;

        // Modify dueDate and startDate to accept ranges
        if (req.query.dueDateStart || req.query.dueDateEnd) {
            filter.dueDate = {};
            if (req.query.dueDateStart) filter.dueDate.$gte = AsianTimeParse(req.query.dueDateStart);
            if (req.query.dueDateEnd) filter.dueDate.$lte = AsianTimeParse(req.query.dueDateEnd);
        }

        if (req.query.startDateStart || req.query.startDateEnd) {
            filter.startDate = {};
            if (req.query.startDateStart) filter.startDate.$gte = AsianTimeParse(req.query.startDateStart);
            if (req.query.startDateEnd) filter.startDate.$lte = AsianTimeParse(req.query.startDateEnd);
        }

        if (req.query.tags) filter.tags = { $all: req.query.tags.split(",") };

        // Fetch filtered or all todos
        const todos = await Todo.find({ ...filter, group: { _id: getGroupId(req) } }).sort({ dueDate: 1 });
        res.status(200).json(dateSimplifier(todos));
    } catch (error) {
        res.status(500).json({ success: false, reason: error.message });
    }
};

// GET /todo/:id - Retrieve a single todo by ID
export const getTodoById = async (req, res) => {

    if (!(await isAllConfigured(req))) {
        res.status(503).send({ success: false, reason: "Unauthorized" });
        return;
    }

    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ error: "Todo not found" });
        if (todo.group._id != getGroupId(req)) return res.status(503).send({ success: false, reason: "Unauthorized" });
        res.status(200).json(dateSimplifier(todo));
    } catch (error) {
        res.status(500).json({ success: false, reason: error.message });
    }
};

// POST /todo - Create a new todo
export const createNewTodo = async (req, res) => {

    if (!(await isAllConfigured(req))) {
        res.status(503).send({ success: false, reason: "Unauthorized" });
        return;
    }

    try {
        let { title, description, dueDate, startDate, tags, status, group } = req.body;
        dueDate = AsianTimeParse(dueDate);
        startDate = AsianTimeParse(startDate);
        if (group != getGroupId(req)) return res.status(503).send({ success: false, reason: "Unauthorized" });
        group = { _id: group };
        const todo = new Todo({ title, description, dueDate, startDate, tags, status, group });
        await todo.save();
        res.status(201).json(dateSimplifier(todo));
    } catch (error) {
        res.status(500).json({ success: false, reason: error.message });
    }
};

// PUT /todo/:id - Update a todo by ID
export const updateTodo = async (req, res) => {

    if (!(await isAllConfigured(req))) {
        res.status(503).send({ success: false, reason: "Unauthorized" });
        return;
    }

    try {
        const updatedTodo = await Todo.findById(req.params.id);
        if (!updatedTodo) return res.status(404).json({ error: "Todo not found" });
        if (updatedTodo.group._id != getGroupId(req)) return res.status(503).send({ success: false, reason: "Unauthorized" });
        if (Object.keys(req.body).includes("group")) return res.status(400).json({ success: false, reason: "You cannot change the group of a todo" });
        if (Object.keys(req.body).includes("dueDate")) {
            req.body.dueDate = AsianTimeParse(req.body.dueDate);
        }
        if (Object.keys(req.body).includes("startDate")) {
            req.body.startDate = AsianTimeParse(req.body.startDate);
        }
        await updatedTodo.updateOne(req.body, { new: true })
        await updatedTodo.save()
        res.status(200).send(dateSimplifier(await Todo.findById(updatedTodo._id)));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /todo/:id - Delete a todo by ID
export const deleteTodo = async (req, res) => {

    if (!(await isAllConfigured(req))) {
        res.status(503).send({ success: false, reason: "Unauthorized" });
        return;
    }

    try {
        const deletedTodo = await Todo.findById(req.params.id);
        if (!deletedTodo) return res.status(404).json({ error: "Todo not found" });
        if (deletedTodo.group._id != getGroupId(req)) return res.status(503).send({ success: false, reason: "Unauthorized" });
        await deletedTodo.deleteOne()
        res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};