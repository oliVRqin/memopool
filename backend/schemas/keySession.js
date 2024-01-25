const mongoose = require('mongoose');

const keySessionSchema = new mongoose.Schema({
    keyId: String,
    sessionId: String,
    userId: { type: String, default: null }
});

module.exports = keySessionSchema;