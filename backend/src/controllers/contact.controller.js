const Contact = require('../models/Contact');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, topic, message } = req.body;
    const contact = await Contact.create({
      name,
      email,
      topic,
      message,
      userId: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Message received. We'll get back to you within 24–48 hours.",
      data: { id: contact._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact };
