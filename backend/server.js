const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// Get random memos from database
app.get('/random', (req, res) => {
    fs.readFile('data.json', (err, data) => {
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
      console.log("randomMemo: ", randomMemo);
      res.json(randomMemo);
    });
});

// POST new memo to database
app.post('/', (req, res) => {
    const newData = req.body;
    // Read existing data from JSON
    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        let jsonData = JSON.parse(data || '[]');  // If the file is empty, parse an empty array

        // Push new data to the jsonData
        jsonData.push(newData);

        // Write data back to the JSON file
        fs.writeFile('./data.json', JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
            } else {
                res.status(200).send('Data written to file');
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
