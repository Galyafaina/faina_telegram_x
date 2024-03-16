const TelegramBot = require('node-telegram-bot-api');
const Twit = require('twit');
const axios = require('axios');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Twitter API configuration
const twitterConfig = {
  consumer_key: 'YOUR_TWITTER_CONSUMER_KEY',
  consumer_secret: 'YOUR_TWITTER_CONSUMER_SECRET',
  access_token: 'YOUR_TWITTER_ACCESS_TOKEN',
  access_token_secret: 'YOUR_TWITTER_ACCESS_TOKEN_SECRET',
};

const twitterClient = new Twit(twitterConfig);

// Function to get tweets from a specific user
async function getTweetsByUsername(username) {
  try {
    const response = await twitterClient.get('statuses/user_timeline', { screen_name: username, count: 5 });
    const tweets = response.data.map(tweet => tweet.text);
    return tweets.join('\n\n');
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return 'Failed to fetch tweets. Please try again later.';
  }
}

// Event listener for the '/tweets' command
bot.onText(/\/tweets (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1];
  const tweets = await getTweetsByUsername(username);
  bot.sendMessage(chatId, tweets);
});

// Event listener for the '/tweet' command to post tweets
bot.onText(/\/tweet (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const tweetText = match[1];
  try {
    const tweet = await twitterClient.post('statuses/update', { status: tweetText });
    bot.sendMessage(chatId, 'Tweet posted successfully.');
  } catch (error) {
    console.error('Error posting tweet:', error);
    bot.sendMessage(chatId, 'Failed to post tweet. Please try again later.');
  }
});

// Event listener for unsupported commands
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Unsupported command. Use /tweets <username> to get tweets or /tweet <text> to post a tweet.');
});
