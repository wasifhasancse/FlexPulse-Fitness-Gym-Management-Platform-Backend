const { getDatabase } = require("../config/db");

const getContactCollection = () => getDatabase().collection("contactMessages");

const ContactModel = {
};

module.exports = ContactModel;
