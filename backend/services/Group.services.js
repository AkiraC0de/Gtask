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

}

module.exports = {
  registerGroup,
  softDeleteGroup
}