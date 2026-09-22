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

const claimTrialPass = async (req, res, next) => {
  try {
    const { fullName, name, email, phone, preferredDate, preferredTime, fitnessGoal } = req.body;
    const nameVal = fullName || name;
    if (!nameVal || !email) {
      return res.status(400).json({ message: "Full name and email are required." });
    }

    const pass = await ContactModel.createTrialPass({
      fullName: nameVal,
      email,
      phone: phone || "",
      preferredDate: preferredDate || new Date().toISOString().split("T")[0],
      preferredTime: preferredTime || "Morning (08:00 AM - 11:00 AM)",
      fitnessGoal: fitnessGoal || "General Fitness & Health",
    });

    res.status(201).json({
      success: true,
      message: "Congratulations! Your 1-Day VIP Trial Pass has been generated.",
      passCode: pass.passCode,
      pass,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  claimTrialPass,
};
