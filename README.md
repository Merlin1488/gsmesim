# Worker + D1 Database + Telegram Bot

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/d1-template)

![Worker + D1 Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/cb7cb0a9-6102-4822-633c-b76b7bb25900/public)

<!-- dash-content-start -->

This project demonstrates a Cloudflare Worker with D1 database and Telegram Bot integration. The bot echoes all received messages back to the group along with the full request body.

## Features

- **D1 Database**: Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/))
- **Telegram Bot**: Webhook-based bot that echoes messages with full request body
- **Cloudflare Workers**: Serverless functions at the edge

### D1 Database

A simple frontend displays the result of this query:

```SQL
SELECT * FROM comments LIMIT 3;
```

The D1 database is initialized with a `comments` table and this data:

```SQL
INSERT INTO comments (author, content)
VALUES
    ('Kristian', 'Congrats!'),
    ('Serena', 'Great job!'),
    ('Max', 'Keep up the good work!')
;
```

### Telegram Bot Integration

The worker includes a webhook endpoint (`/webhook`) that:
- Receives messages from Telegram
- Echoes the message text back to the chat
- Includes the full JSON request body in the response

For detailed setup instructions, see [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md).

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](https://github.com/cloudflare/templates/tree/main/d1-template#setup-steps) before deploying.

<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```
npm create cloudflare@latest -- --template=cloudflare/templates/d1-template
```

A live public deployment of this template is available at [https://d1-template.templates.workers.dev](https://d1-template.templates.workers.dev)

## Setup Steps

### D1 Database Setup

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```
2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) with the name "d1-template-database":
   ```bash
   npx wrangler d1 create d1-template-database
   ```
   ...and update the `database_id` field in `wrangler.json` with the new database ID.
3. Run the following db migration to initialize the database (notice the `migrations` directory in this project):
   ```bash
   npx wrangler d1 migrations apply --remote d1-template-database
   ```

### Telegram Bot Setup

Follow the instructions in [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) to:
- Create a Telegram bot with BotFather
- Configure the bot token
- Set up the webhook

### Deploy

4. Deploy the project!
   ```bash
   npx wrangler deploy
   ```

## API Endpoints

- `GET /` - Shows the D1 database content (default page)
- `POST /webhook` - Telegram webhook endpoint for receiving messages
