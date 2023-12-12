require('dotenv').config();
const { REST, Routes, Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DalleApi } = require('./Dalle');

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

// Event handler for when the bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  refreshCommands();
  resetCommandUsage();
});

// Event handler for interactions (commands, buttons, etc.)
client.on('interactionCreate', async (interaction) => {
  console.log(`Received interaction type: ${interaction.type}`);

  if (interaction.isCommand()) {
    const { commandName, user, options } = interaction;
    const userId = user.id;
    console.log('Options:', options);

    if (commandName === 'generate' && canUseCommand(userId, commandName, 3)) {
      try {
        await interaction.deferReply();
        const userPrompt = options.getString('prompt') || 'a white siamese cat';
        const apiData = await DalleApi(userPrompt);

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Image Generated Successfully')
          .setImage(apiData.data[0].url)
          .setDescription(`**Prompt:** ${userPrompt} \n **Revised Prompt:** ${apiData.data[0].revised_prompt}`);

        setTimeout(() => {
          interaction.editReply({ embeds: [embed] });
        }, 4000);
      } catch (error) {
        await interaction.editReply(`${error.message}`);
      }
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
