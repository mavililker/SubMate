require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const { OpenAI } = require('openai');

const openai = new OpenAI(
  {
    apiKey: process.env.OPENAI_API_KEY
  }
);



app.get('/getresponse', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: 150
});

res.json({ response: completion.choices[0].message.content.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});



module.exports = app;
