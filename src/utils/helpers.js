const { ObjectId } = require("mongodb");

const normalizeStatus = (value = "") => String(value).trim().toLowerCase();

const isValidObjectId = (id) => {
  return Boolean(id && ObjectId.isValid(id));
};

const toObjectId = (id) => {
  if (isValidObjectId(id)) {
    return new ObjectId(id);
  }
  return null;
};

module.exports = {
  normalizeStatus,
  isValidObjectId,
  toObjectId,
};
