const Group = require('../models/Group');
const { REGISTER_GROUP_REQUIRED_FIELDS } = require("../constants/requiredFields");

const { 
  registerGroup,
  softDeleteGroup
} = require("../services/Group.services");

const { 
  checkRequestBody, 
  checkRequiredFields 
} = require("../utils/validation");
const MissingFieldError = require('../errors/MissingFieldError');


const createGroup = async (req, res) => {
  checkRequestBody(req.body);
  const groupData =  {leader: req.user._id, ...req.body}
  checkRequiredFields(REGISTER_GROUP_REQUIRED_FIELDS, groupData);
  const result = await registerGroup(groupData);

  return res.status(201).json({
    success: true,
    message: result.message,
    group: result.group
  })
}

// Unfinished
const deleteGroup = async (req, res) => {
  const {groupId} = req.params;

  if(!groupId){
    throw new MissingFieldError('groupId parameter is required.');
  }

  const result = await softDeleteGroup(groupId);
  
  return res.status(201).json({
    success: true,
    message: result.message,
  })
}

// ADMIN CONTROLLERS
const getAllGroups = async (req, res) => {
  const allGroups = await Group.find({});

  return res.status(200).json({
    succes: true,
    message: 'Here is all the groups',
    totalCount: allGroups.length,
    groups: allGroups,
  })
}

module.exports = {
  createGroup,
  deleteGroup,

  getAllGroups
}