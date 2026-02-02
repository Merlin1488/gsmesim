# Telegram Bot Setup Guide

This guide explains how to set up the Telegram bot integration for gsmesim.

## Prerequisites

1. A Telegram account
2. Cloudflare Workers account
3. This project deployed to Cloudflare Workers

## Setup Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat and send `/newbot`
3. Follow the instructions to choose a name and username for your bot
4. BotFather will give you a token that looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Save this token - you'll need it in the next step

### 2. Configure the Bot Token

You have two options to configure the bot token:

#### Option A: Using wrangler.json (for development)

1. Open `wrangler.json`
2. Update the `TELEGRAM_BOT_TOKEN` value with your bot token:
   ```json
   "vars": {
     "TELEGRAM_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE"
   }
   ```

#### Option B: Using Cloudflare Dashboard (for production, recommended)

1. Go to your Cloudflare Workers dashboard
2. Select your worker (`gsmesim`)
3. Go to Settings > Variables
4. Add a new environment variable:
   - Variable name: `TELEGRAM_BOT_TOKEN`
   - Value: Your bot token from BotFather
5. Save the changes

### 3. Deploy Your Worker

```bash
npm run deploy
```

After deployment, you'll get a URL like: `https://gsmesim.YOUR_SUBDOMAIN.workers.dev`

### 4. Set Up the Webhook

Use this command to tell Telegram where to send updates (replace with your actual values):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://gsmesim.YOUR_SUBDOMAIN.workers.dev/webhook"}'
```

Alternatively, you can use this URL in your browser:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://gsmesim.YOUR_SUBDOMAIN.workers.dev/webhook
```

### 5. Test Your Bot

1. Add your bot to a Telegram group or send it a direct message
2. Send any message
3. The bot should echo back your message along with the full request body

## How It Works

- The worker receives webhook POST requests from Telegram at `/webhook`
- It parses the incoming message
- It echoes back both:
  - The message text that was received
  - The full JSON request body (formatted)
- All messages are sent back to the same chat where they were received

## Troubleshooting

### Bot doesn't respond

1. Check that the webhook is set correctly:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

2. Check the Cloudflare Workers logs:
   ```bash
   npx wrangler tail
   ```

3. Verify the `TELEGRAM_BOT_TOKEN` is set correctly in your environment variables

### Permission errors

Make sure your bot has permission to send messages in the group. If it's a group, the bot needs to be added as a member.

## API Endpoints

- `GET /` - Shows the D1 database content (default page)
- `POST /webhook` - Telegram webhook endpoint for receiving updates

## Security Notes

- Never commit your bot token to version control
- Use environment variables for production deployments
- Keep your wrangler.json with empty token value in the repository
