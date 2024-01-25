const mongoose = require('mongoose');

const memoSchema = new mongoose.Schema({
    id: String,
    sessionId: String,
    time: String,
    memo: String,
    sentimentScores: String,
    positivityScore: String,
    keyId: String,
    userId: { type: String, default: null },
    tags: [String],
    visibility: { type: String, default: 'private' }
});

module.exports = memoSchema;