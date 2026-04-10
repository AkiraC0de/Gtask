const express = require('express');
const verifyAuth = require('../middlewares/verifyAuth');
const errorHandler = require('../middlewares/errorHandler');

const taskRoute = express.Router();

const { createTask, updateTask } = require('../controllers/Task.controller');

// Create Task Route
taskRoute.post('/', verifyAuth, createTask);

// // Update Task Route
// taskRoute.put('/:taskId', verifyAuth, updateTask);

taskRoute.use(errorHandler);

module.exports = taskRoute;