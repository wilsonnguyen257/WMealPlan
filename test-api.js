require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const data = {
  contents: [{
    parts: [{
      text: "Say hello"
    }]
  }]
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
  console.log('Success:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});
