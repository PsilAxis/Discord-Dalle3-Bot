const axios = require('axios');

// More information on image generation here: https://platform.openai.com/docs/guides/images/usage?context=node&lang=node.js
async function DalleApi(prompt) {
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      // Add any other required parameters here
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // use backticks (``)
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Error making API call: ${error.message}`);
  }
}

module.exports = {
  DalleApi,
};
