const mongoose = require('mongoose');
const ERROR_CODES = require('../constants/errorCodes');
const GenericError = require('../errors/GenericError');
const Group = require('../models/Group');
const { validateGroupData } = require("../utils/validation")

const registerGroup = async (groupData = {}) => {
  validateGroupData(groupData);

  const {
    name,
    description,
    leader,
    maxMembers,
    settings,
    bannerUrl,
  } = groupData;

  const newGroup = await Group.create({
    name,
    description,
    leader,
    maxMembers: maxMembers || 8, 
    settings,
    bannerUrl,
    members: [{ userId: leader, role: 'leader' }] 
  });

  return {
    message: `The group (${newGroup.name}) has created.`,
    group : {
      name: newGroup.toPublicJSON()
    }
    };
  }

const softDeleteGroup = async (groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new GenericError(400, 'Invalid Group ID.', ERROR_CODES.INVALID_ID);
  }

  const existGroup = await Group.findById(groupId);

  if(!existGroup){
    throw new GenericError(400, 'Group cannot be found.', ERROR_CODES.INVALID_ID);
  }

  await Group.findByIdAndUpdate(groupId, { status : 'inactive'});

  return {
    message: `The group (${groupId}) has been deleted.`,
  };
}

module.exports = {
  registerGroup,
  softDeleteGroup
}