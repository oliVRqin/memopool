const mongoose = require('mongoose');

const keySessionSchema = new mongoose.Schema({
    keyId: String,
    sessionId: String
});

module.exports = keySessionSchema;