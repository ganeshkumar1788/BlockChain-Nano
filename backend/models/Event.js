const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  action: { type: String, required: true }, // 'REGISTER', 'AUTH_SUCCESS', 'AUTH_REJECT'
  hash: { type: String, required: true },
  status: { type: String, required: true } // 'Verified' or 'Rejected'
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
