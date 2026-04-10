const express = require('express');
const verifyAuth = require('../middlewares/verifyAuth');
const errorHandler = require('../middlewares/errorHandler');

const { 
  createGroup
} = require('../controllers/Group.controller');

const groupRoute = express.Router();

// Create Group Route
groupRoute.post('/', verifyAuth, createGroup);

groupRoute.use(errorHandler);

module.exports = groupRoute;