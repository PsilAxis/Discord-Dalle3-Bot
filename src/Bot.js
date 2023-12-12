require('dotenv').config();
const { REST, Routes, Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DalleApi } = require('./Dalle');
const { moderationCheck } = require('./Moderation');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Define bot commands
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'generate',
    description: 'Generates an image using Dall-E 3',
    options: [
      {
        name: 'prompt',
        description: 'Custom prompt for image generation',
        type: 3, // STRING type
        required: false,
      },
    ],
  },
];

// Set up Discord REST API
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Set up Discord bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Object to store command usage counts
const commandUsage = {};

// Queue to manage image generation requests
// Queue is required because of my openai account level which only allows 1 image generation request per minute. 
// More Info on rate limits here: https://platform.openai.com/docs/guides/rate-limits/usage-tiers?context=tier-free
const imageGenerationQueue = [];
let isImageGenerationInProgress = false;

// Function to reset command usage
function resetCommandUsage() {
  setInterval(() => {
    commandUsage['generate'] = {};
  }, 24 * 60 * 60 * 1000); // Reset every 24 hours
}

// Function to check if a user can use a command
function canUseCommand(userId, commandName, maxUsesPerDay) {
  commandUsage[commandName] = commandUsage[commandName] || {};
  commandUsage[commandName][userId] = commandUsage[commandName][userId] || 0;

  if (commandUsage[commandName][userId] < maxUsesPerDay) {
    commandUsage[commandName][userId]++;
    return true;
  }

  return false;
}

// Function to refresh bot commands
async function refreshCommands() {
  try {
    console.log('Started refreshing application (/) commands.');
    const result = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands:', result);
  } catch (error) {
    console.error('Error refreshing commands:', error);
  }
}

// Function to handle image generation requests
async function handleImageGeneration(interaction, userPrompt) {
  try {
    // Check the user's input against the moderation API to avoid bans.
    const isPromptAllowed = await moderationCheck(userPrompt);

    // If the prompt is allowed, add the request to the queue
    if (isPromptAllowed) {
      imageGenerationQueue.push({ interaction, userPrompt });
      processImageGenerationQueue();
    } else {
      await interaction.editReply("Your prompt is NOT allowed.");
    }
  } catch (error) {
    await interaction.editReply(`${error.message}`);
  }
}

// Function to process the image generation queue
async function processImageGenerationQueue() {
  if (!isImageGenerationInProgress && imageGenerationQueue.length > 0) {
    isImageGenerationInProgress = true;
    const { interaction, userPrompt } = imageGenerationQueue.shift();

    try {
      // Perform image generation
      const apiData = await DalleApi(userPrompt);

      // Create an Embeded message with the image and prompts
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Image Generated Successfully')
        .setImage(apiData.data[0].url)
        .setDescription(`**Prompt:** ${userPrompt} \n **Revised Prompt:** ${apiData.data[0].revised_prompt}`);

      // Edits the "Bot is thinking..." message to show the new embeded message with the generated image
      await interaction.editReply({ embeds: [embed] });

      // Wait for a minute before processing the next request
      setTimeout(() => {
        isImageGenerationInProgress = false;
        processImageGenerationQueue();
      }, 60 * 1000);
    } catch (error) {
      await interaction.editReply(`${error.message}`);
      isImageGenerationInProgress = false;
      processImageGenerationQueue();
    }
  }
}

// Event handler for when the bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  refreshCommands();
  resetCommandUsage();
});

// Event handler for interactions (commands, buttons, etc.)
client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName, user, options } = interaction;
    const userId = user.id;

    if (commandName === 'generate' && canUseCommand(userId, commandName, 3)) {
      await interaction.deferReply();

      const userPrompt = options.getString('prompt') || 'a white siamese cat';
      handleImageGeneration(interaction, userPrompt);
    } else if (commandName === 'ping') {
      await interaction.reply('Pong!');
    } else {
      await interaction.reply(`You have reached the maximum usage for the '${commandName}' command today.`);
    }
  } else if (interaction.isButton()) {
    // Handle button clicks or other message components here
  }
});

// Log in to Discord
client.login(TOKEN);
