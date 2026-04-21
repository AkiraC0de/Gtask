const express = require('express');
const verifyAuth = require('../middlewares/verifyAuth');
const errorHandler = require('../middlewares/errorHandler');
const verifyAdmin = require('../middlewares/verifyAdmin');

const { 
  createGroup,
  deleteGroup,
  getAllGroups
} = require('../controllers/Group.controller');


const groupRoute = express.Router();

// Create Group Route
groupRoute.post('/', verifyAuth, createGroup);

// Soft Delete Group Route
groupRoute.delete('/:groupId', verifyAuth, deleteGroup);

// ADMIN ROUTES
groupRoute.get('/all', verifyAuth, verifyAdmin, getAllGroups);

groupRoute.use(errorHandler);

module.exports = groupRoute;