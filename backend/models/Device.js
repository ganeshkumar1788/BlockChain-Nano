const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  type: { type: String, default: 'ESP32' },
  registered: { type: Boolean, default: false },
  trustScore: { type: Number, default: 0 } // Trust logic: Increase for valid, Decrease for invalid
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
