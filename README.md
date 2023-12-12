# Discord Dall-E 3 Bot
This repository contains a Discord bot that generates images using the OpenAI Dall-E model. Users can interact with the bot by using commands to generate images based on custom prompts.

## Setup
Follow these instructions to set up and run the bot on your Discord server.

## Prerequisites
Node.js installed on your machine

Discord bot Token and Client ID - https://discord.com/developers/applications

OpenAI API key - https://platform.openai.com/api-keys

## Installation
Clone the repository:

- git clone

- cd into folder

Install dependencies:

- npm install

## Create a .env file in the root directory of the project with the following content:

BOT_TOKEN=your-discord-bot-token

CLIENT_ID=your-discord-client-id

OPENAI_API_KEY=your-openai-api-key

Replace your-discord-bot-token, your-discord-client-id, and your-openai-api-key with your Discord bot token, Discord client ID, and OpenAI API key, respectively.

## Usage
Run the bot:
- npm start

The bot will log into Discord, and you can invite it to your server using the provided invite link from the developement portal.
## Required scopes and permission:
Scopes required are "Bot" and "applications.commands"
### Send Messages
Required for the bot to send messages and replies in text channels.
### Embed Links
Required for the bot to send embeds, which are used to display generated images.
### Read Message History
Required to read message history for commands and interactions.
### Use Slash Commands
Required for registering and using slash commands, which are used for bot interactions.
### Read Messages/View Channels
- Required for the bot to read messages and respond to commands.
- Required to access and view the text channels where the bot is active.

## Bot Commands
/ping: Replies with "Pong!"

/generate: Generates an image using Dall-E 3. Optionally, you can provide a custom prompt for image generation.

### Additional Information
The bot limits users to 3 uses of the /generate command per day.

The Dall-E API endpoint is used for image generation, and the generated image is displayed in a Discord embed.

Troubleshooting

If you encounter any issues or have questions, feel free to open an issue in this repository.

Happy generating! 🎨
