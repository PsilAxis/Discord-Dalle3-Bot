const axios = require('axios');

// Function to check the user's input against the moderation API
async function moderationCheck(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/moderations',
        { input: prompt },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // console.log('Moderation API Response:', response.data);
  
      const { results } = response.data;
  
      if (results && results.length > 0) {
        const { flagged } = results[0];
  
        // Check if the input is flagged based on your policy
        if (flagged) {
          // Handle the case where the input violates OpenAI's policies
          console.log('Content violates OpenAI policies.');
          return false;
        } else {
          // Input is allowed
          console.log('Content is allowed.');
          return true;
        }
      } else {
        console.error('No results found in the moderation response.');
        return false;
      }
    } catch (error) {
      console.error(`Error checking moderation: ${error.message}`);
      // If an error occurs, you might want to handle it accordingly
      return false;
    }
  }
  
  module.exports = {
    moderationCheck,
  };
  