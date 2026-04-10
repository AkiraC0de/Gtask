const GenericError = require('../errors/GenericError');
const Task = require('../models/Task');

const createTask = async (req, res) => {
    if(!req.body) {
        throw new GenericError(400, 'Request body cannot be empty.', ERROR_CODES.MISSING_FIELD);
    }

    // Extract request body from what only field needed
    const { title, description, deadline } = req.body;

    // Verify if there are missing field
    // SHOULD HAVE A DEADLINE VALIDATION
    if(!title || !description || !deadline || !req.user._id){
        return res.status(400).json({success: false, message: 'Incomplete data'})
    }

    const newTask = await Task.create({
        title, 
        description, 
        deadline,
        createdBy: req.user._id 
    });

    res.status(200).json({
        success: true, 
        message: 'New Task has been created'
    })
} 

const updateTask = async (req, res) => {
    try {
        const user = req.user
        const taskId = req.params.taskId;
        const updates = req.body;

        // Verify if the request body has content
        if(!req.body) return res.status(400).json({success: false, message: 'the request has no content'});

        // Validate the ID paramter if it has content
        if(!taskId) return res.status(400).json({success: false, message: 'Undefined Task ID parameter'});

        const task = await Task.findById(taskId);
        if(!task) return res.status(400).json({success: false, message: `Task (${taskId} does not exist`});

        // Verify if the request sender was the owner of the Task or an Admin
        const isOwner = String(task.createdBy) === String(user._id);
        const isAdmin = String(user.role) === "admin";

        if(!isOwner && !isAdmin) return res.status(401).json({success: false, message: 'You are not authorized to update this task'});

        const updatedTask = await Task.findByIdAndUpdate(
            taskId, 
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedTask})

        await task.save();
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: true, message: error.message})
    }
}

module.exports = { createTask, updateTask }