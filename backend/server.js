const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const redis = require('redis');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// Redis Configuration
const redisClient = redis.createClient();

async function initializeRedis() {
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
});

// OpenAI API Configuration 
const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Getting keys from Redis for debugging and testing purposes
app.get('/redis-data', async (req, res) => {
    const keys = await redisClient.keys('*');
    if (keys.length === 0) {
        return res.status(404).send('No keys found in Redis');
    } else {
        console.log("keys: ", keys)
        return res.status(200).send(keys);
    }
});

// Deleting keys from Redis for debugging and testing purposes
app.delete('/delete-cache/:key', async (req, res) => {
    const keyToDelete = req.params.key;
    const deleteKey = await redisClient.del(keyToDelete);
    if (deleteKey === 1) {
        return res.status(200).send('Deleted successfully!');
    } else if (deleteKey === 0) {
        return res.status(404).send('Key not found');
    } else {
        return res.status(500).send('Server error');
    }
});

// POST request for analyzing sentiment of a memo
app.post('/analyze-sentiment', async (req, res) => {
    let newData = req.body;
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
    const keyExists = await redisClient.exists(id);
    if (keyExists === 1) {
        return res.status(409).send("Conflict: Key already exists");
    } else if (keyExists === 0) {
        fs.readFile('./db.json', 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }
            let jsonData = JSON.parse(data || '[]');  // If the file is empty, parse an empty array

            const systemPrompt = {
                "role": "system", 
                "content": "You are an assistant which responds strictly with the following format template, for each emotion and value asked: <emotion>: <value>\n"
            }
            const userPrompt = {
                "role": "user", 
                "content": `On a scale of 1-10, analyze the intensity of strictly the following sentiments in the text: happiness, joy, surprise, sadness, fear, anger, disgust. ${memo}`
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
                console.log("used total_tokens in error: ", response.data.usage.total_tokens)
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
            console.log("used total_tokens: ", response.data.usage.total_tokens)
            console.log("updated newData: ", newData)

            // Serialize the memo object
            const serializedMemo = JSON.stringify(newData);
            // Store it in Redis
            redisClient.set(id, serializedMemo, (err) => {
                if (err) {
                    console.error('Error storing memo in Redis:', err);
                    return res.status(500).send('Server error');
                }
                res.status(200).send('Memo stored successfully');
            });

            const cachedMemo = await redisClient.get(id);
            console.log("cachedMemo: ", cachedMemo)
    
            // Push new data to the jsonData
            jsonData.push(newData);
    
            // Write data back to the JSON file
            fs.writeFile('./db.json', JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Server error');
                } else {
                    res.status(200).send(JSON.stringify('Data written to file'));
                }
            });
        });
        // Finally, add this to Mongo here. ChatGPT has an implementation of this. 
    } else {
        return res.status(500).send("Server error");
    }
})

// Get random memos from database
app.get('/random', (req, res) => {
    fs.readFile('db.json', (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error reading data');
        return;
      }

      const memos = JSON.parse(data);
      if (memos.length === 0) {
        res.status(404).send('No memos found');
        return;
      }

      const randomMemo = memos[Math.floor(Math.random() * memos.length)];
      res.json(randomMemo);
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
