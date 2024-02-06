const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require("openai");
// const redis = require('redis');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const crypto = require('crypto');
const memoSchema = require('./schemas/memo')
const keySessionSchema = require('./schemas/keySession')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5003;

app.use(cors({
  credentials: true,
  origin: [process.env.FRONTEND_ORIGIN, 'http://localhost:3000']
}));

app.use(express.json());
app.set("trust proxy", 1);
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { 
        secure: process.env.NODE_ENV === "production" ? true : false, 
        httpOnly: true, 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    } 
}));

app.use((req, res, next) => {
    if (!req.session.sessionId) {
        req.session.sessionId = req.sessionID;
    } else {
        console.log('Session ID found');
    }
    next();
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connection established')
  })
  .catch(err => console.error('MongoDB connection error:', err));

const KeySession = mongoose.model('KeySession', keySessionSchema);

const Memo = mongoose.model('Memo', memoSchema, 'memos');

// Redis Configuration
/* const redisClient = redis.createClient({
    password: process.env.REDIS_PW,
    socket: {
        host: process.env.REDIS_SOCKET_HOST,
        port: process.env.REDIS_PORT
    }
}); */

/* async function initializeRedis() {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    } catch (error) {
        console.error("Error connecting to Redis:", error);
    }
}

initializeRedis();
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
}); */

// OpenAI API Configuration 
const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Function to find k closest memos in positivityScore
async function findKClosestMemos(positivityScore, memoId, memos, k) {
    // Filter out the memo with the provided memoId (we don't want the same message to be the most similar)
    const filteredMemos = memos.filter(memo => memo.id !== memoId);

    let answers = filteredMemos.map(memo => {
        const plainObject = memo.toObject();
        return {
          ...plainObject,
          scoreDifference: Math.abs(parseFloat(plainObject.positivityScore) - parseFloat(positivityScore))
        };
    }).sort((a, b) => a.scoreDifference - b.scoreDifference)
    .slice(0, k);

    return answers;
}

// TODO:
// 1. Add a GET request which recommends activities based on the memos + other contextual information
// for the user. For example, it notices that user have a high positivity score when outside, so it recommends it?

// Getting keys from Redis for debugging and testing purposes
/* app.get('/redis-data', async (req, res) => {
    const keys = await redisClient.keys('*');
    if (keys.length === 0) {
        return res.status(404).send('No keys found in Redis');
    } else {
        console.log("keys: ", keys)
        return res.status(200).send(keys);
    }
}); */

// Deleting keys from Redis for debugging and testing purposes
/* app.delete('/delete-cache/:key', async (req, res) => {
    const keyToDelete = req.params.key;
    const deleteKey = await redisClient.del(keyToDelete);
    if (deleteKey === 1) {
        return res.status(200).send('Deleted successfully!');
    } else if (deleteKey === 0) {
        return res.status(404).send('Key not found');
    } else {
        return res.status(500).send('Server error');
    }
}); */

// GET request to see whether current session ID exists in KeySession store
app.get('/does-session-id-exist-in-keysession-store', async (req, res) => {
    const sessionId = req.session.sessionId;
    const keySession = await KeySession.findOne({ sessionId: sessionId });
    if (keySession) {
        res.json({ keySessionExists: true });
    } else {
        res.json({ keySessionExists: false });
    }
})

// POST request for generating keys as a good complement to session ID 
app.post('/generate-key', async (req, res) => {
    const sessionId = req.session.sessionId;
    const keyId = crypto.randomBytes(16).toString('hex');
    try {
        const newKeySession = new KeySession({ keyId, sessionId });
        await newKeySession.save();
        res.json({ keyId });
    } catch (error) {
        res.status(500).send('Error generating key');
    }
});

// POST request allowing users to use key to retrieve session data
app.post('/retrieve-session', async (req, res) => {
    const { keyId } = req.body;
    const keySession = await KeySession.findOne({ keyId: keyId });
    if (keySession) {
        // We're going to update the new session ID to the keySession store to align UI + data
        keySession.sessionId = req.sessionID;
        await keySession.save();
        // Proceed with the new session ID
        res.json({ message: 'Session updated.', sessionId: req.sessionID });
    } else {
        res.status(404).send('Key not found');
    }
});

// POST request for finding others' profiles and their public memos
app.post('/view-specific-user', async (req, res) => {
    const { userId } = req.body;
    try {
        const memos = await Memo.find({ userId: userId, visibility: "public" });
        res.json(memos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching memos' });
    }
})

// POST request for finding memos with similar sentiment 
app.post('/find-memos-with-similar-sentiment', async (req, res) => {
    const keySession = await KeySession.findOne({ sessionId: req.session.sessionId });
    const memos = await Memo.find({ keyId: keySession.keyId });
    try {
        const positivityScore = req.body.positivityScore;
        const memoId = req.body.id;
        const numSimilarMemos = 2; // Hardcoded to 2 for now, could change
        const similarMemos = await findKClosestMemos(positivityScore, memoId, memos, numSimilarMemos);
        res.json(similarMemos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// PUT request for changing visibility of a memo
app.put('/change-memo-visibility', async (req, res) => {
    try {
        const { newVisibilitySetting, memoId } = req.body;
        const filter = { id: memoId };
        const update = { visibility: newVisibilitySetting }
        const doc = await Memo.findOneAndUpdate(filter, update, {
            returnOriginal: false
        });
        res.json(doc)
    } catch (error) {
        res.status(500).json({ error: 'Error changing visibility' });
    }
})

// GET request for fetching keyId
app.get('/get-keyId', async (req, res) => {
    const keySession = await KeySession.findOne({ sessionId: req.session.sessionId });
    if (keySession) {
       res.json({ keyId: keySession.keyId })
    } else {
        res.status(404).send('KeySession not found');
    }
})

// GET request for fetching userId
app.get('/get-userId', async (req, res) => {
    const keySession = await KeySession.findOne({ sessionId: req.session.sessionId });
    if (keySession) {
        // could be null or a string value
        res.json({ userId: keySession.userId });
    } else {
        res.status(404).send('KeySession not found');
    }
})

// TODO: add safeguards to prevent the creation of the same userID as another user, as well as frontend warnings for this
// POST request for adding or changing userId and tying it to the key
app.post('/change-userId', async (req, res) => {
    const keySession = await KeySession.findOne({ sessionId: req.session.sessionId });
    const { userId } = req.body;
    if (keySession) {
        const filter = { keyId: keySession.keyId };
        const update = { userId: userId }
        // Updates the userId to its appropriate key session
        keySession.userId = userId;
        await keySession.save();
        // Updates past memos' userIds to new userId
        Memo.updateMany(filter, update, {
            new: true
        });
        res.json({ message: 'User ID updated.'});
    } else {
        res.status(404).send('KeySession not found');
    }
})

// GET request for fetching users' own specific memos, matches by session id
app.get('/my-memos', async (req, res) => {
    const keySession = await KeySession.findOne({ sessionId: req.session.sessionId });
    try {
      const memos = await Memo.find({ keyId: keySession.keyId });
      res.json(memos);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching memos' });
    }
});

// GET request for fetching the public MemoPool
app.get('/see-public-memos', async (req, res) => {
    try {
        const publicMemos = await Memo.find({ visibility: "public" })
        res.json(publicMemos)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching public memos' });
    }
})

// POST request for analyzing sentiment of a memo
app.post('/analyze-sentiment', async (req, res) => {
    const keySession = await KeySession.findOne({ sessionId: req.session.sessionId });
    let newData = {
        ...req.body,
        sessionId: req.session.sessionId,
        keyId: keySession.keyId, 
        userId: keySession.userId,
        tags: [], // Will add option in future
        visibility: 'private' // Set default to private
    };

    // ID needs to be passed in from the frontend for the redisClient key
    const id = req.body.id;
    // Memo needs to be passed in from the frontend
    const memo = req.body.memo;

    // If the first word of the memo is a number, then we need to return an error
    const firstWord = memo.split(" ")[0];
    if (parseInt(firstWord)) {
        return res.status(406).send("Bad request: Invalid memo. Memo cannot started with a number.");
    }

    // Checking if key exists in Redis
    /* const keyExists = await redisClient.exists(id);
    if (keyExists === 1) {
        return res.status(409).send("Conflict: Key already exists");
    } else if (keyExists === 0) { */
        const systemPrompt = {
            "role": "system", 
            "content": "You are an assistant which responds strictly with the following format template, for each emotion and value asked: <emotion>: <value>\n"
        }
        const userPrompt = {
            "role": "user", 
            "content": `Strictly on a scale of 1-10, analyze the intensity of strictly the following sentiments in the text: happiness, joy, surprise, sadness, fear, anger, disgust. ${memo}`
        };
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [systemPrompt, userPrompt],
            max_tokens: 200,
            temperature: 0,
        });
        const result = response.data.choices[0].message.content;
        console.log("result: ", result)

        // Check if result begins with "happiness:" — if not, then it's an invalid memo
        if (!result.startsWith("happiness:")) {
            // Add error handling and send to frontend
            // console.log("used total_tokens in error: ", response.data.usage.total_tokens)
            return res.status(400).send("Bad request: Invalid memo. Please try again! (Note: Shorter, misspelled, or nonsensical memos usually lack context, and thus, are harder to analyze.)");
        }

        // Add sentimentScores to the newData object
        newData["sentimentScores"] = result;

        // split the result by new lines and run a loop through them
        const splitResult = result.split("\n");
        let positivityScore = 0;
        splitResult.forEach((item) => {
            // split each item by the colon
            const splitItem = item.split(":");
            // trim the whitespace from the key and value
            const key = splitItem[0].trim();
            const value = splitItem[1].trim();
            // We need to make sure that the parseInt(value) is a number between 1 and 10
            if (parseInt(value) < 1 || parseInt(value) > 10) {
                return res.status(400).send("Bad request: Invalid memo. Please try again! (Note: Shorter, misspelled, or nonsensical memos usually lack context, and thus, are harder to analyze.)");
            }
            // TODO: opportunity to refactor into a list of weights
            if (key === "happiness"){
                positivityScore += 1 * value;
            } else if (key === "joy") {
                positivityScore += 1 * value;
            } else if (key === "surprise") {
                positivityScore += 0.45 * value;
            } else if (key === "sadness") {
                positivityScore += 0.01 * value;
            } else if (key === "fear") {
                positivityScore += 0.02 * value;
            } else if (key === "anger") {
                positivityScore += 0.01 * value;
            } else if (key === "disgust") {
                positivityScore += 0.01 * value;
            }
        })
        const multiplierSum = 1 + 1 + 0.45 + 0.01 + 0.02 + 0.01 + 0.01;
        // We divide by the sum of the weights
        positivityScore = (positivityScore / multiplierSum).toFixed(3);

        // Add positivityScore to the newData object
        newData["positivityScore"] = positivityScore;
        // console.log("used total_tokens: ", response.data.usage.total_tokens)
        console.log("updated newData: ", newData)

        // Serialize the memo object
        // const serializedMemo = JSON.stringify(newData);
        // Store it in Redis
        /* redisClient.set(id, serializedMemo, (err) => {
            if (err) {
                console.error('Error storing memo in Redis:', err);
                return res.status(500).send('Server error');
            }
            res.status(200).send('Memo stored successfully');
        });

        const cachedMemo = await redisClient.get(id);
        console.log("cachedMemo: ", cachedMemo) */

        const newMemo = new Memo(newData);
        try {
            await newMemo.save();
            res.status(200).json(newData);
        } catch (error) {
            console.error('Error storing memo in MongoDB:', error);
            res.status(500).json({ error: 'Error storing memo in MongoDB' });
        }            
    /* } else {
        return res.status(500).send("Server error");
    } */
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
