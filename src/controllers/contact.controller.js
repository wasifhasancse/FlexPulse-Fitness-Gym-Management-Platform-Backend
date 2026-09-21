const ContactModel = require("../models/contact.model");

const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const result = await ContactModel.createMessage({
      name,
      email,
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you shortly!",
      result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
};
